
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { MODULE_REGISTRY, TOTAL_NODES, ONBOARDING_NODES_COUNT, DOMAIN_SETTINGS } from './constants.ts';
import { translations } from './translations.ts';
import { calculateGenesisCore } from './services/psychologyService.ts';
import { DomainType, Translations, AnalysisResult, GameHistoryItem, BeliefKey, ScanHistory } from './types.ts';
import { StorageService, STORAGE_KEYS } from './services/storageService.ts';
import { simpleHash, resolvePath } from './utils/helpers.ts';
import { useTestEngine } from './hooks/useTestEngine.ts';
import { AdaptiveQuestionEngine } from './services/adaptiveQuestionEngine.ts';

// View Imports
import { AuthView } from './components/views/AuthView.tsx';
import { BootView } from './components/views/BootView.tsx';
import { DashboardView, NodeUI } from './components/views/DashboardView.tsx';
import { TestView, BodySyncView, ReflectionView } from './components/views/TestModule.tsx';
import { ResultsView } from './components/views/ResultsView.tsx';
import { AdminPanel } from './components/views/AdminPanel.tsx';
import { generateShareImage } from './utils/shareGenerator.ts';

const ADMIN_HASH = 56345; 

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem(STORAGE_KEYS.LANG) as 'ru' | 'ka') || 'ru');
  const t: Translations = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'boot' | 'dashboard' | 'test' | 'body_sync' | 'reflection' | 'results' | 'admin'>('auth');
  const [activeModule, setActiveModule] = useState<DomainType | null>(null);
  const [currentDomain, setCurrentDomain] = useState<DomainType | null>(null);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [bootShown, setBootShown] = useState(() => sessionStorage.getItem('genesis_boot_seen') === 'true');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory | null>(null);
  const [forceGlitch, setForceGlitch] = useState(false);

  const engine = useTestEngine({
    completedNodeIds,
    setCompletedNodeIds,
    setView,
    activeModule,
    setActiveModule,
    isDemo
  });

  const result = useMemo<AnalysisResult | null>(() => {
    if (engine.state.history.length === 0) return null;
    return calculateGenesisCore(engine.state.history);
  }, [engine.state.history]);

  const adaptiveState = useMemo(() => {
    const history = engine.state.history;
    const baseline = history.length > 0 
      ? history.slice(0, 5).reduce((a, b) => a + b.latency, 0) / Math.max(1, Math.min(5, history.length))
      : 2000;
    return AdaptiveQuestionEngine.getAdaptiveState(history, baseline);
  }, [engine.state.history]);

  const globalProgress = useMemo(() => {
    return Math.min(100, Math.round(adaptiveState.clarity));
  }, [adaptiveState.clarity]);

  const isGlitchMode = forceGlitch || (result && result.entropyScore > 45);
  const getSceneText = useCallback((textKey: string) => resolvePath(t, textKey), [t]);

  useEffect(() => {
    window.Telegram?.WebApp?.expand?.();
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    
    const savedNodesRaw = StorageService.load<(string | number)[]>(STORAGE_KEYS.NODES, []);
    const savedNodes = savedNodesRaw.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
    const sessionAuth = localStorage.getItem(STORAGE_KEYS.SESSION);
    const history = StorageService.getScanHistory();

    setCompletedNodeIds(savedNodes);
    setScanHistory(history);

    if (sessionAuth === 'true') {
        setView('dashboard');
        setIsDemo(false);
    } else if (sessionAuth === 'demo') {
        setView('dashboard');
        setIsDemo(true);
    }
  }, [lang]);

  const nodes = useMemo(() => {
    const allNodes: NodeUI[] = [];
    DOMAIN_SETTINGS.forEach((config: any) => {
      for (let i = 0; i < config.count; i++) {
        const absoluteId = config.startId + i;
        const isCompleted = completedNodeIds.includes(absoluteId);
        let isActive = absoluteId < ONBOARDING_NODES_COUNT || completedNodeIds.includes(absoluteId - 1);
        if (isCompleted) isActive = true;
        if (isDemo && absoluteId >= 3) isActive = false;
        allNodes.push({ id: absoluteId, domain: config.key, active: isActive, done: isCompleted });
      }
    });
    return allNodes;
  }, [completedNodeIds, isDemo]);

  const handleLogin = useCallback((password: string, demo = false) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    if (demo) {
        localStorage.setItem(STORAGE_KEYS.SESSION, 'demo');
        setIsDemo(true);
        setView(bootShown ? 'dashboard' : 'boot');
        return;
    }
    const inputHash = simpleHash(password.toLowerCase().trim());
    if (inputHash === ADMIN_HASH) { setView('admin'); return; }
    if (password === "genesis_lab_entry") {
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
      setIsDemo(false);
      setView(bootShown ? 'dashboard' : 'boot');
    }
  }, [bootShown]);

  const handleLogout = useCallback(() => {
     window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
     localStorage.removeItem(STORAGE_KEYS.SESSION);
     sessionStorage.removeItem('genesis_boot_seen');
     setBootShown(false);
     setView('auth');
  }, []);

  const handleReset = useCallback(() => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
    const msg = lang === 'ru' ? "Сбросить текущую сессию?" : "გსურთ სესიის გადატვირთვა?";
    if (confirm(msg)) {
      StorageService.clear();
      sessionStorage.removeItem('genesis_boot_seen');
      setBootShown(false);
      setCompletedNodeIds([]);
      setView('auth');
      window.location.reload();
    }
  }, [lang]);

  const handleContinue = useCallback(() => {
    if (adaptiveState.isComplete) { setView('results'); return; }
    const nextId = adaptiveState.suggestedNextNodeId;
    if (nextId === null) { setView('results'); return; }
    const numericId = parseInt(nextId);
    let nextDomain: DomainType | null = null;
    for (const d of DOMAIN_SETTINGS) {
        if (numericId >= d.startId && numericId < (d.startId + d.count)) { nextDomain = d.key; break; }
    }
    if (nextDomain) engine.startNode(numericId, nextDomain);
    else setView('dashboard');
  }, [adaptiveState, engine]);

  useEffect(() => {
    if (adaptiveState.isComplete && result && view === 'results') { StorageService.saveScan(result); }
  }, [adaptiveState.isComplete, result, view]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const blob = await generateShareImage(result, t);
    const text = `Genesis OS Blueprint: ${t.archetypes[result.archetypeKey].title}. Share Code: ${result.shareCode}`;
    if (blob && navigator.share) {
       try {
         const file = new File([blob], 'genesis_blueprint.png', { type: 'image/png' });
         if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: 'Genesis OS Blueprint', text, files: [file] });
            return;
         }
       } catch(e) { console.error('Share failed', e); }
    }
    window.Telegram?.WebApp?.openLink?.(t.results.share_url);
  }, [result, t]);

  const layoutProps = { lang, onLangChange: setLang, soundEnabled, onSoundToggle: () => setSoundEnabled(!soundEnabled), onLogout: handleLogout, onReset: handleReset };

  return (
    <div className={isGlitchMode ? 'glitch' : ''}>
      {view === 'auth' && <Layout {...layoutProps}><AuthView onLogin={handleLogin} t={t} /></Layout>}
      {view === 'boot' && <Layout {...layoutProps}><BootView isDemo={isDemo} onComplete={() => { sessionStorage.setItem('genesis_boot_seen', 'true'); setBootShown(true); setView('dashboard'); }} /></Layout>}
      {view === 'dashboard' && (
        <Layout {...layoutProps}>
          <DashboardView t={t} isDemo={isDemo} globalProgress={globalProgress} result={result} currentDomain={currentDomain} nodes={nodes} completedNodeIds={completedNodeIds} onSetView={setView as any} onSetCurrentDomain={onSetCurrentDomain => setCurrentDomain(onSetCurrentDomain)} onStartNode={engine.startNode} onLogout={handleLogout} scanHistory={scanHistory} />
        </Layout>
      )}
      {view === 'test' && activeModule && (
        <Layout {...layoutProps}>
          <TestView t={t} activeModule={activeModule} currentId={engine.state.currentId} scene={MODULE_REGISTRY[activeModule]?.[engine.state.currentId]} onChoice={engine.handleChoice} onExit={() => setView('dashboard')} getSceneText={getSceneText} adaptiveState={adaptiveState} />
        </Layout>
      )}
      {view === 'body_sync' && <Layout {...layoutProps}><BodySyncView t={t} onSync={engine.syncBodySensation} /></Layout>}
      {view === 'reflection' && <Layout {...layoutProps}><ReflectionView t={t} sensation={engine.state.history[engine.state.history.length - 1]?.sensation} /></Layout>}
      {view === 'results' && result && (
        <Layout {...layoutProps}>
          <ResultsView t={t} result={result} isGlitchMode={!!isGlitchMode} onContinue={handleContinue} onShare={handleShare} onBack={() => setView('dashboard')} getSceneText={getSceneText} adaptiveState={adaptiveState} />
        </Layout>
      )}
      {view === 'admin' && (
        <Layout {...layoutProps}>
          <AdminPanel t={t} onExit={() => setView('auth')} result={result} history={engine.state.history} onUnlockAll={() => { const allIds = Array.from({ length: TOTAL_NODES }, (_, i) => i); setCompletedNodeIds(allIds); StorageService.save(STORAGE_KEYS.NODES, allIds); }} glitchEnabled={forceGlitch} onToggleGlitch={() => setForceGlitch(!forceGlitch)} />
        </Layout>
      )}
    </div>
  );
};

export default App;
