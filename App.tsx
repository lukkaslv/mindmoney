
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { MODULE_REGISTRY, TOTAL_NODES, ONBOARDING_NODES_COUNT, DOMAIN_SETTINGS } from './constants.ts';
import { translations } from './translations.ts';
import { calculateGenesisCore } from './services/psychologyService.ts';
import { DomainType, Translations, AnalysisResult } from './types.ts';
import { StorageService, STORAGE_KEYS } from './services/storageService.ts';
import { simpleHash, resolvePath } from './utils/helpers.ts';
import { useTestEngine } from './hooks/useTestEngine.ts';

// View Imports
import { AuthView } from './components/views/AuthView.tsx';
import { BootView } from './components/views/BootView.tsx';
import { DashboardView, NodeUI } from './components/views/DashboardView.tsx';
import { TestView, BodySyncView, ReflectionView } from './components/views/TestModule.tsx';
import { ResultsView } from './components/views/ResultsView.tsx';
import { generateShareImage } from './utils/shareGenerator.ts';

const AUTH_HASHES = [3333279, 104079552, 3002454];

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem(STORAGE_KEYS.LANG) as 'ru' | 'ka') || 'ru');
  const t: Translations = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'boot' | 'dashboard' | 'test' | 'body_sync' | 'reflection' | 'results'>('auth');
  const [activeModule, setActiveModule] = useState<DomainType | null>(null);
  const [currentDomain, setCurrentDomain] = useState<DomainType | null>(null);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [bootShown, setBootShown] = useState(() => sessionStorage.getItem('genesis_boot_seen') === 'true');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Initialize Custom Hook for Test Logic
  const engine = useTestEngine({
    completedNodeIds,
    setCompletedNodeIds,
    setView,
    activeModule,
    setActiveModule,
    isDemo
  });

  // DERIVED STATE
  const result = useMemo<AnalysisResult | null>(() => {
    if (engine.state.history.length === 0) return null;
    return calculateGenesisCore(engine.state.history);
  }, [engine.state.history]);

  const globalProgress = useMemo(() => {
    return Math.min(100, Math.round((completedNodeIds.length / TOTAL_NODES) * 100));
  }, [completedNodeIds]);

  const nextRecommendedId = useMemo(() => {
     if (completedNodeIds.length === 0) return 0;
     return Math.max(...completedNodeIds) + 1;
  }, [completedNodeIds]);

  const isGlitchMode = result && result.entropyScore > 45;
  const getSceneText = useCallback((textKey: string) => resolvePath(t, textKey), [t]);

  // INITIALIZATION
  useEffect(() => {
    window.Telegram?.WebApp?.expand?.();
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    
    const savedNodes = StorageService.load<number[]>(STORAGE_KEYS.NODES, []);
    const sessionAuth = localStorage.getItem(STORAGE_KEYS.SESSION);

    setCompletedNodeIds(savedNodes);

    if (sessionAuth === 'true') {
        setView('dashboard');
        setIsDemo(false);
    } else if (sessionAuth === 'demo') {
        setView('dashboard');
        setIsDemo(true);
    }
  }, [lang]);

  // UI HELPERS
  const nodes = useMemo(() => {
    const allNodes: NodeUI[] = [];
    const progressPerNode = 100 / TOTAL_NODES;
    const unlockThreshold = progressPerNode * 0.85;

    DOMAIN_SETTINGS.forEach((domainConfig: any) => {
      for (let i = 0; i < domainConfig.count; i++) {
        const absoluteId = domainConfig.startId + i;
        const isCompleted = completedNodeIds.includes(absoluteId);
        
        let isActive = absoluteId < (ONBOARDING_NODES_COUNT) || 
                         completedNodeIds.includes(absoluteId - 1) || 
                         (globalProgress > (absoluteId * unlockThreshold));
        
        if (isDemo && absoluteId >= 3) {
            isActive = false;
        }

        allNodes.push({
          id: absoluteId,
          domain: domainConfig.key,
          active: isActive,
          done: isCompleted
        });
      }
    });
    return allNodes;
  }, [globalProgress, completedNodeIds, isDemo]);

  const handleLogin = useCallback((password: string, demo = false) => {
    if (demo) {
        localStorage.setItem(STORAGE_KEYS.SESSION, 'demo');
        setIsDemo(true);
        if (!bootShown) setView('boot');
        else setView('dashboard');
        return;
    }
    const inputHash = simpleHash(password.toLowerCase().trim());
    if (AUTH_HASHES.includes(inputHash)) {
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
      setIsDemo(false);
      if (!bootShown) setView('boot');
      else setView('dashboard');
    } else {
       window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error');
    }
  }, [bootShown]);

  const handleLogout = useCallback(() => {
     localStorage.removeItem(STORAGE_KEYS.SESSION);
     sessionStorage.removeItem('genesis_boot_seen');
     setBootShown(false);
     setView('auth');
  }, []);

  const handleContinue = useCallback(() => {
    const targetId = nextRecommendedId;
    if (isDemo && targetId >= 3) { setView('dashboard'); return; }
    if (targetId >= TOTAL_NODES) { setView('dashboard'); return; }

    const nextNode = nodes.find(n => n.id === targetId);
    if (nextNode && nextNode.active) {
       engine.startNode(targetId, nextNode.domain);
    } else {
       setView('dashboard');
    }
  }, [nextRecommendedId, isDemo, nodes, engine]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    
    // Generate Image
    const blob = await generateShareImage(result, t);
    const shareUrl = t.results.share_url;
    const text = `Genesis OS Blueprint: ${t.archetypes[result.archetypeKey].title}`;

    // Use Web Share API Level 2 if supported
    if (blob && navigator.share) {
       try {
         const file = new File([blob], 'genesis_blueprint.png', { type: 'image/png' });
         if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
               title: 'Genesis OS Blueprint',
               text: text,
               files: [file]
            });
            return;
         }
       } catch(e) { console.error('Share failed', e); }
    }

    // Fallback
    window.Telegram?.WebApp?.openLink?.(shareUrl);
  }, [result, t]);

  // --- VIEW RENDERING ---

  const layoutProps = {
    lang,
    onLangChange: setLang,
    soundEnabled,
    onSoundToggle: () => setSoundEnabled(!soundEnabled)
  };

  if (view === 'auth') return (
    <Layout {...layoutProps}>
      <AuthView onLogin={handleLogin} t={t} />
    </Layout>
  );

  if (view === 'boot') return (
    <Layout {...layoutProps}>
      <BootView isDemo={isDemo} onComplete={() => { 
          sessionStorage.setItem('genesis_boot_seen', 'true');
          setBootShown(true); 
          setView('dashboard'); 
      }} />
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout {...layoutProps}>
      <DashboardView 
        t={t} isDemo={isDemo} globalProgress={globalProgress} result={result}
        currentDomain={currentDomain} nodes={nodes} completedNodeIds={completedNodeIds}
        onSetView={setView as any} onSetCurrentDomain={setCurrentDomain}
        onStartNode={engine.startNode} onLogout={handleLogout}
      />
    </Layout>
  );

  if (view === 'test' && activeModule) {
    const scene = MODULE_REGISTRY[activeModule]?.[engine.state.currentId];
    if (!scene) return null;
    return (
      <Layout {...layoutProps}>
        <TestView 
          t={t} activeModule={activeModule} currentId={engine.state.currentId} 
          scene={scene} onChoice={engine.handleChoice} onExit={() => setView('dashboard')} 
          getSceneText={getSceneText} 
        />
      </Layout>
    );
  }

  if (view === 'body_sync') return (
    <Layout {...layoutProps}>
      <BodySyncView t={t} onSync={engine.syncBodySensation} />
    </Layout>
  );

  if (view === 'reflection') {
     const lastItem = engine.state.history[engine.state.history.length - 1];
     return (
        <Layout {...layoutProps}>
          <ReflectionView t={t} sensation={lastItem?.sensation} />
        </Layout>
     );
  }

  if (view === 'results' && result) return (
    <Layout {...layoutProps}>
      <ResultsView 
        t={t} result={result} isGlitchMode={!!isGlitchMode} nextRecommendedId={nextRecommendedId}
        onContinue={handleContinue} onShare={handleShare} onBack={() => setView('dashboard')}
        getSceneText={getSceneText}
      />
    </Layout>
  );

  return null;
};

export default App;
