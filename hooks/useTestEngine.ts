
import { useState, useRef, useCallback, useEffect } from 'react';
import { DomainType, GameHistoryItem, Choice, ChoiceWithLatency } from '../types';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { MODULE_REGISTRY, ONBOARDING_NODES_COUNT, TOTAL_NODES, DOMAIN_SETTINGS } from '../constants';

interface UseTestEngineProps {
  completedNodeIds: number[];
  setCompletedNodeIds: (ids: number[]) => void;
  setView: (view: any) => void;
  activeModule: DomainType | null;
  setActiveModule: (d: DomainType | null) => void;
  isDemo: boolean;
}

export const useTestEngine = ({
  completedNodeIds,
  setCompletedNodeIds,
  setView,
  activeModule,
  setActiveModule,
  isDemo
}: UseTestEngineProps) => {
  
  const [state, setState] = useState({ 
    currentId: '0', 
    history: [] as GameHistoryItem[], 
    lastChoice: null as ChoiceWithLatency | null 
  });
  
  const [lastSelectedNode, setLastSelectedNode] = useState<number | null>(null);

  const nodeStartTime = useRef<number>(0);
  const backgroundStart = useRef<number>(0);
  const totalPausedTime = useRef<number>(0);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedHistory = StorageService.load<GameHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
    setState(prev => ({ ...prev, history: savedHistory }));
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        backgroundStart.current = performance.now();
      } else {
        if (backgroundStart.current > 0) {
          const pausedDuration = performance.now() - backgroundStart.current;
          totalPausedTime.current += pausedDuration;
          backgroundStart.current = 0;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const startNode = useCallback((nodeId: number, domain: DomainType) => {
    if (isDemo && nodeId >= 3) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
        return;
    }
    setLastSelectedNode(nodeId);
    setActiveModule(domain);
    setState(prev => ({ ...prev, currentId: nodeId.toString(), lastChoice: null }));
    setView('test');
    
    totalPausedTime.current = 0;
    backgroundStart.current = 0;
    requestAnimationFrame(() => {
      nodeStartTime.current = performance.now();
    });
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
  }, [isDemo, setActiveModule, setView]);

  const advanceNode = useCallback((nextNodes: number[]) => {
    const nextId = Math.max(...nextNodes) + 1;
    if (nextId >= TOTAL_NODES) { setView('results'); return; }
    if (isDemo && nextId >= 3) { setView('dashboard'); return; }

    // FATIGUE DETECTION: If history is long and user slowing down, force dashboard return
    if (state.history.length > 0 && state.history.length % 10 === 0) {
        setView('dashboard');
        return;
    }

    let nextDomain: DomainType | null = null;
    for (const d of DOMAIN_SETTINGS) {
        if (nextId >= d.startId && nextId < (d.startId + d.count)) {
            nextDomain = d.key;
            break;
        }
    }
    if (nextDomain) startNode(nextId, nextDomain);
    else setView('dashboard');
  }, [isDemo, setView, startNode, state.history]);

  const syncBodySensation = useCallback((sensation: string) => {
    if (!state.lastChoice) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');

    const newItem: GameHistoryItem = { 
      beliefKey: state.lastChoice.beliefKey, 
      sensation, 
      latency: state.lastChoice.latency 
    };
    
    let nextNodes = [...completedNodeIds];
    if (lastSelectedNode !== null && !completedNodeIds.includes(lastSelectedNode)) {
        nextNodes = [...completedNodeIds, lastSelectedNode];
    }

    setState(prev => {
        const nextHistory = [...prev.history, newItem];
        StorageService.save(STORAGE_KEYS.HISTORY, nextHistory);
        return { ...prev, history: nextHistory };
    });

    setCompletedNodeIds(nextNodes);
    StorageService.save(STORAGE_KEYS.NODES, nextNodes);

    if (sensation === 's0') {
         advanceNode(nextNodes);
    } else {
        setView('reflection');
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
           advanceNode(nextNodes);
        }, 1500);
    }
  }, [state.lastChoice, lastSelectedNode, completedNodeIds, advanceNode, setCompletedNodeIds, setView]);

  const handleChoice = useCallback((choice: Choice) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); 
    const now = performance.now();
    const cleanLatency = Math.max(0, now - nodeStartTime.current - totalPausedTime.current);
    const choiceWithLatency: ChoiceWithLatency = { ...choice, latency: cleanLatency };
    
    if (activeModule) {
        const currentScene = MODULE_REGISTRY[activeModule][state.currentId];
        const numericId = parseInt(state.currentId);
        const shouldSample = numericId < ONBOARDING_NODES_COUNT || currentScene.intensity >= 4;

        setState(prev => ({ ...prev, lastChoice: choiceWithLatency }));
        if (shouldSample) setView('body_sync');
        else {
             const newItem: GameHistoryItem = { beliefKey: choice.beliefKey, sensation: 's0', latency: cleanLatency };
             let nextNodes = [...completedNodeIds];
             if (lastSelectedNode !== null && !completedNodeIds.includes(lastSelectedNode)) nextNodes = [...completedNodeIds, lastSelectedNode];
             setState(prev => {
                const nextHistory = [...prev.history, newItem];
                StorageService.save(STORAGE_KEYS.HISTORY, nextHistory);
                return { ...prev, history: nextHistory };
             });
             setCompletedNodeIds(nextNodes);
             StorageService.save(STORAGE_KEYS.NODES, nextNodes);
             advanceNode(nextNodes);
        }
    }
  }, [activeModule, state.currentId, completedNodeIds, lastSelectedNode, advanceNode, setCompletedNodeIds, setView]);

  return { state, startNode, handleChoice, syncBodySensation };
};
