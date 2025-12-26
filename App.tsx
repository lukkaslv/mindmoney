import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { MODULE_REGISTRY, TOTAL_NODES, ONBOARDING_NODES_COUNT, DOMAIN_SETTINGS } from './constants.ts';
// FIXED: Remove .ts extension for consistent module resolution
import { translations } from './translations';
import { calculateRawMetrics } from './services/psychologyService.ts';
import { DiagnosticEngine } from './services/diagnosticEngine.ts';
import { DomainType, Translations, AnalysisResult, GameHistoryItem, ScanHistory, DataCorruptionError } from './types.ts';
import { StorageService, STORAGE_KEYS, SessionState } from './services/storageService.ts';
import { resolvePath, PlatformBridge } from './utils/helpers.ts';
import { useTestEngine } from './hooks/useTestEngine.ts';
import { AdaptiveQuestionEngine } from './services/adaptiveQuestionEngine.ts';
import { PatternDetector } from './services/PatternDetector.ts';

// View Imports
import { AuthView } from './components/views/AuthView.tsx';
import { BootView } from './components/views/BootView.tsx';
import { DashboardView, NodeUI } from './components/views/DashboardView.tsx';
import { TestView, BodySyncView, ReflectionView } from './components/views/TestModule.tsx';
import { ResultsView } from './components/views/ResultsView.tsx';
import { AdminPanel } from './components/views/AdminPanel.tsx';
import { CompatibilityView } from './components/views/CompatibilityView.tsx';
import { GuideView } from './components/views/GuideView.tsx';
import { BriefExplainerView } from './components/views/BriefExplainerView.tsx';
import { DataCorruptionView } from './components/views/DataCorruptionView.tsx';
import { generateShareImage } from './utils/shareGenerator.ts';
import { InvalidResultsView } from './components/views/InvalidResultsView.tsx';
import { SystemIntegrityView } from './components/views/SystemIntegrityView.tsx';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem(STORAGE_KEYS.LANG) as 'ru' | 'ka') || 'ru');
  const t: Translations = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'boot' | 'dashboard' | 'test' | 'body_sync' | 'reflection' | 'results' | 'admin' | 'compatibility' | 'guide' | 'brief_explainer' | 'system_integrity'>('auth');
  const [dataStatus, setDataStatus] = useState<'ok' | 'corrupted'>('ok');
  const [activeModule, setActiveModule] = useState<DomainType | null>(null);
  const [currentDomain, setCurrentDomain] = useState<DomainType | null>(null);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [bootShown, setBootShown] = useState(() => sessionStorage.getItem('genesis_boot_seen') === 'true');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory | null>(null);
  const [forceGlitch, setForceGlitch] = useState(false);

  const [history, setHistory] = useState<GameHistoryItem[]>([]);

  const engine = useTestEngine({
    completedNodeIds,
    setCompletedNodeIds: (fn: any) => setCompletedNodeIds(fn),
    history,
    setHistory: (fn: any) => setHistory(fn),
    setView,
    activeModule,
    setActiveModule,
    isDemo
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEYS.SESSION_STATE) {
            try {
                const newState = JSON.parse(e.newValue || '{}') as SessionState;
                if (newState.nodes) setCompletedNodeIds(newState.nodes);
                if (newState.history) setHistory(newState.history);
            } catch (err) { console.error("Tab Sync Error", err); }
        }
    };
    window.addEventListener('storage', handleStorage);
    
    if (window.Telegram?.WebApp?.BackButton) {
        const bb = window.Telegram.WebApp.BackButton;
        if (view !== 'auth' && view !== 'dashboard' && view !== 'admin' && view !== 'system_integrity') {
            bb.show();
            const handleBack = () => {
                if (view === 'test' || view === 'body_sync') {
                    PlatformBridge.showConfirm(
                        lang === 'ru' ? "Выйти в дашборд? Прогресс текущего вопроса будет потерян." : "გსურთ გასვლა?",
                        (confirmed) => {
                            if (confirmed) setView('dashboard');
                        }
                    );
                } else {
                    setView('dashboard');
                }
            };
            bb.onClick(handleBack);
            return () => {
                bb.offClick(handleBack);
                bb.hide();
            };
        } else {
            bb.hide();
        }
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, [view, lang]);

  const result = useMemo<AnalysisResult | null>(() => {
    if (history.length < ONBOARDING_NODES_COUNT) return null;
    const rawResult = calculateRawMetrics(history);
    const patternFlags = PatternDetector.analyze(history);
    return DiagnosticEngine.interpret(rawResult, patternFlags);
  }, [history]);

  const adaptiveState = useMemo(() => {
    const baseline = history.length > 0 
      ? history.slice(0, 5).reduce((a, b) => a + b.latency, 0) / Math.max(1, Math.min(5, history.length))
      : 2000;
    return AdaptiveQuestionEngine.getAdaptiveState(history, baseline);
  }, [history]);

  const globalProgress = useMemo(() => {
    return Math.min(100, Math.round(adaptiveState.clarity));
  }, [adaptiveState.clarity]);

  const isGlitchMode = forceGlitch || (result && result.entropyScore > 45);
  const getSceneText = useCallback((textKey: string) => resolvePath(t, textKey), [t]);

  useEffect(() => {
    PlatformBridge.ready();
    PlatformBridge.expand();
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    
    try {
        const sessionState = StorageService.load<SessionState>(STORAGE_KEYS.SESSION_STATE, { nodes: [], history: [] });
        setCompletedNodeIds(sessionState.nodes.map(id => typeof id === 'string' ? parseInt(id, 10) : id));
        setHistory(sessionState.history);
    } catch (e) {
        if (e instanceof DataCorruptionError) setDataStatus('corrupted');
    }

    const loadedScanHistory = StorageService.getScanHistory();
    setScanHistory(loadedScanHistory);

    const sessionAuth = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (sessionAuth === 'true') { setView('dashboard'); setIsDemo(false); setIsPro(true); }
    else if (sessionAuth === 'demo') { setView('dashboard'); setIsDemo(true); setIsPro(false); }
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

  const handleLogin = useCallback((password: string, demo = false): boolean => {
    PlatformBridge.haptic.impact('light');
    if (demo) {
        localStorage.setItem(STORAGE_KEYS.SESSION, 'demo');
        setIsDemo(true);
        setIsPro(false);
        setView(bootShown ? 'dashboard' : 'boot');
        return true;
    }
    const cleanPassword = password.toLowerCase().trim();
    if (cleanPassword === "genesis_prime") { setIsPro(true); setView('admin'); return true; }
    if (cleanPassword === "genesis_lab_entry") {
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
      setIsDemo(false);
      setIsPro(true);
      setView(bootShown ? 'dashboard' : 'boot');
      return true;
    }
    PlatformBridge.haptic.notification('error');
    return false;
  }, [bootShown]);

  const handleLogout = useCallback(() => {
     localStorage.removeItem(STORAGE_KEYS.SESSION);
     sessionStorage.removeItem('genesis_boot_seen');
     setBootShown(false);
     setIsPro(false);
     setView('auth');
  }, []);

  const handleReset = useCallback((force: boolean = false) => {
    const performResetAction = () => {
      StorageService.clear();
      sessionStorage.removeItem('genesis_boot_seen');
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      setBootShown(false);
      setCompletedNodeIds([]);
      setHistory([]);
      setDataStatus('ok');
      setIsDemo(false);
      setIsPro(false);
      setView('auth');
      PlatformBridge.haptic.notification('success');
    };

    if (force) {
      performResetAction();
    } else {
      PlatformBridge.showConfirm(
        lang === 'ru' ? "Сбросить текущую сессию?" : "გსურთ სესიის გადატვირთვა?",
        (confirmed) => {
          if (confirmed) performResetAction();
        }
      );
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
    const text = `Genesis OS Blueprint: ${t.archetypes[result.archetypeKey]?.title || 'Analysis'}. Share Code: ${result.shareCode}`;
    if (blob && navigator.share) {
       try {
         const file = new File([blob], 'genesis_blueprint.png', { type: 'image/png' });
         if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: 'Genesis OS Blueprint', text, files: [file] });
            return;
         }
       } catch(e) { console.error('Share failed', e); }
    }
    PlatformBridge.openLink(t.results.share_url);
  }, [result, t]);

  const layoutProps = { lang, onLangChange: setLang, soundEnabled, onSoundToggle: () => setSoundEnabled(!soundEnabled), onLogout: handleLogout, onReset: () => handleReset(false) };

  const renderCurrentView = () => {
    if (dataStatus === 'corrupted') return <DataCorruptionView t={t} onReset={() => handleReset(true)} />;
    switch (view) {
      case 'auth': return <AuthView onLogin={handleLogin} t={t} lang={lang} onLangChange={setLang} />;
      case 'boot': return <BootView isDemo={isDemo} onComplete={() => { sessionStorage.setItem('genesis_boot_seen', 'true'); setBootShown(true); setView('dashboard'); }} t={t} />;
      case 'dashboard': return <DashboardView lang={lang} t={t} isDemo={isDemo} globalProgress={globalProgress} result={result} currentDomain={currentDomain} nodes={nodes} completedNodeIds={completedNodeIds} onSetView={setView as any} onSetCurrentDomain={onSetCurrentDomain => setCurrentDomain(onSetCurrentDomain)} onStartNode={engine.startNode} onLogout={handleLogout} scanHistory={scanHistory} />;
      case 'test': return !activeModule ? null : <TestView t={t} activeModule={activeModule} currentId={engine.state.currentId} scene={MODULE_REGISTRY[activeModule]?.[engine.state.currentId]} onChoice={engine.handleChoice} onExit={() => setView('dashboard')} getSceneText={getSceneText} adaptiveState={adaptiveState} />;
      case 'body_sync': return <BodySyncView lang={lang} t={t} onSync={engine.syncBodySensation} />;
      case 'reflection': return <ReflectionView lang={lang} t={t} sensation={history[history.length - 1]?.sensation} />;
      case 'results': if (!result) return null; return result.validity === 'INVALID' ? <InvalidResultsView t={t} onReset={() => handleReset(true)} patternFlags={result.patternFlags} /> : <ResultsView lang={lang} t={t} result={result} isGlitchMode={!!isGlitchMode} onContinue={handleContinue} onShare={handleShare} onBack={() => setView('dashboard')} getSceneText={getSceneText} adaptiveState={adaptiveState} onOpenBriefExplainer={() => setView('brief_explainer')} />;
      case 'compatibility': return <CompatibilityView lang={lang} userResult={result} isProSession={isPro} onUnlockPro={() => setIsPro(true)} t={t} onBack={() => setView('dashboard')} />;
      case 'guide': return <GuideView t={t} onBack={() => setView('dashboard')} />;
      case 'brief_explainer': return <BriefExplainerView t={t} onBack={() => setView('results')} />;
      default: return <AuthView onLogin={handleLogin} t={t} lang={lang} onLangChange={setLang} />;
    }
  };
  
  return (
    <div className={`w-full h-full ${isGlitchMode ? 'glitch' : ''}`}>
      {view === 'admin' ? (
        <AdminPanel t={t} onExit={() => setView('auth')} result={result} history={history} onUnlockAll={engine.forceCompleteAll} glitchEnabled={forceGlitch} onToggleGlitch={() => setForceGlitch(!forceGlitch)} onSetView={setView} />
      ) : view === 'system_integrity' ? (
        <SystemIntegrityView t={t} onBack={() => setView('admin')} />
      ) : view === 'auth' ? (
        <AuthView onLogin={handleLogin} t={t} lang={lang} onLangChange={setLang} />
      ) : view === 'boot' ? (
        <BootView isDemo={isDemo} onComplete={() => { sessionStorage.setItem('genesis_boot_seen', 'true'); setBootShown(true); setView('dashboard'); }} t={t} />
      ) : (
        <Layout {...layoutProps}>{renderCurrentView()}</Layout>
      )}
    </div>
  );
};

export default App;