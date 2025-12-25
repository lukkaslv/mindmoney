
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
  const hardwareLatencyOffset = useRef<number>(0); 
  const userBaselineLatency = useRef<number>(2000); // Default baseline
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedHistory = StorageService.load<GameHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
    setState(prev => ({ ...prev, history: savedHistory }));
    
    // Attempt to load hardware calibration
    const cal = localStorage.getItem('genesis_hardware_cal');
    if (cal) hardwareLatencyOffset.current = parseFloat(cal);

    // Calculate user baseline from existing history if available
    if (savedHistory.length >= 5) {
        const avg = savedHistory.slice(0, 5).reduce((acc, h) => acc + h.latency, 0) / 5;
        userBaselineLatency.current = avg;
    }
  }, []);

  const startNode = useCallback((nodeId: number, domain: DomainType) => {
    if (isDemo && nodeId >= 3) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
        return;
    }
    
    if (state.history.length === 0) {
        const start = performance.now();
        requestAnimationFrame(() => {
            hardwareLatencyOffset.current = performance.now() - start;
            localStorage.setItem('genesis_hardware_cal', hardwareLatencyOffset.current.toString());
        });
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
  }, [isDemo, state.history.length, setActiveModule, setView]);

  const advanceNode = useCallback((nextNodes: number[]) => {
    const nextId = Math.max(...nextNodes) + 1;
    if (nextId >= TOTAL_NODES) { setView('results'); return; }
    if (isDemo && nextId >= 3) { setView('dashboard'); return; }

    // Milestone Insight Logic: every 10 nodes, go back to dashboard to show progress
    if (nextNodes.length > 0 && nextNodes.length % 10 === 0 && !nextNodes.includes(nextId)) {
        setView('dashboard');
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
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
  }, [isDemo, setView, startNode]);

  const syncBodySensation = useCallback((sensation: string) => {
    // FIX: Ensure activeModule exists for required domain property in GameHistoryItem
    if (!state.lastChoice || !activeModule) return;

    const newItem: GameHistoryItem = { 
      beliefKey: state.lastChoice.beliefKey, 
      sensation, 
      latency: state.lastChoice.latency,
      nodeId: state.currentId,
      domain: activeModule as DomainType
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
        }, 1200);
    }
  }, [state.lastChoice, activeModule, lastSelectedNode, completedNodeIds, advanceNode, setCompletedNodeIds, setView, state.currentId]);

  const handleChoice = useCallback((choice: Choice) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); 
    const now = performance.now();
    
    const rawLatency = now - nodeStartTime.current - totalPausedTime.current;
    const cleanLatency = Math.max(0, rawLatency - hardwareLatencyOffset.current);
    
    // Update baseline if we are in the first 5 nodes
    if (completedNodeIds.length < 5) {
        userBaselineLatency.current = (userBaselineLatency.current + cleanLatency) / 2;
    }

    const choiceWithLatency: ChoiceWithLatency = { ...choice, latency: cleanLatency };
    
    if (activeModule) {
        const currentScene = MODULE_REGISTRY[activeModule][state.currentId];
        const numericId = parseInt(state.currentId);
        const shouldSample = numericId < ONBOARDING_NODES_COUNT || currentScene.intensity >= 4;

        setState(prev => ({ ...prev, lastChoice: choiceWithLatency }));
        if (shouldSample) setView('body_sync');
        else {
             // FIX: Include domain property in GameHistoryItem
             const newItem: GameHistoryItem = { 
                 beliefKey: choice.beliefKey, 
                 sensation: 's0', 
                 latency: cleanLatency,
                 nodeId: state.currentId,
                 domain: activeModule as DomainType
             };
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
