
import { useState, useRef, useCallback, useEffect } from 'react';
import { DomainType, GameHistoryItem, Choice, ChoiceWithLatency } from '../types';
import { StorageService, STORAGE_KEYS, SessionState } from '../services/storageService';
import { MODULE_REGISTRY, ONBOARDING_NODES_COUNT, TOTAL_NODES, DOMAIN_SETTINGS } from '../constants';

interface UseTestEngineProps {
  completedNodeIds: number[];
  setCompletedNodeIds: (ids: number[]) => void;
  history: GameHistoryItem[];
  setHistory: (history: GameHistoryItem[]) => void;
  setView: (view: any) => void;
  activeModule: DomainType | null;
  setActiveModule: (d: DomainType | null) => void;
  isDemo: boolean;
}

export const useTestEngine = ({
  completedNodeIds,
  setCompletedNodeIds,
  history,
  setHistory,
  setView,
  activeModule,
  setActiveModule,
  isDemo
}: UseTestEngineProps) => {
  
  const [state, setState] = useState({ 
    currentId: '0', 
    history: history, 
    lastChoice: null as ChoiceWithLatency | null 
  });
  
  useEffect(() => {
    setState(prev => ({ ...prev, history }));
  }, [history]);
  
  const [lastSelectedNode, setLastSelectedNode] = useState<number | null>(null);

  const nodeStartTime = useRef<number>(0);
  const pauseStart = useRef<number>(0);
  const totalPausedTime = useRef<number>(0);
  const hardwareLatencyOffset = useRef<number>(0); 
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ATOMICITY FIX: Centralized state commit function
  const commitUpdate = useCallback((newItem: GameHistoryItem, lastNodeId: number) => {
    const newHistory = [...history, newItem];
    let newCompletedNodes = [...completedNodeIds];
    if (!newCompletedNodes.includes(lastNodeId)) {
      newCompletedNodes.push(lastNodeId);
    }
    
    // 1. Update React state
    setHistory(newHistory);
    setCompletedNodeIds(newCompletedNodes);
    
    // 2. Perform a single, atomic save to localStorage
    const sessionState: SessionState = {
        nodes: newCompletedNodes,
        history: newHistory
    };
    StorageService.save(STORAGE_KEYS.SESSION_STATE, sessionState);

    return newCompletedNodes; // Return for advanceNode logic
  }, [history, completedNodeIds, setHistory, setCompletedNodeIds]);

  // Visibility API Protection logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseStart.current = performance.now();
      } else if (pauseStart.current > 0) {
        totalPausedTime.current += performance.now() - pauseStart.current;
        pauseStart.current = 0;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const cal = localStorage.getItem('genesis_hardware_cal');
    if (cal) hardwareLatencyOffset.current = parseFloat(cal);
  }, []);

  const startNode = useCallback((nodeId: number, domain: DomainType) => {
    if (isDemo && nodeId >= 3) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
        return;
    }
    
    if (history.length === 0) {
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
    pauseStart.current = 0;
    requestAnimationFrame(() => {
      nodeStartTime.current = performance.now();
    });
  }, [isDemo, history.length, setActiveModule, setView]);

  const advanceNode = useCallback((nextNodes: number[]) => {
    const nextId = Math.max(...nextNodes) + 1;
    if (nextId >= TOTAL_NODES) { setView('results'); return; }
    if (isDemo && nextId >= 3) { setView('dashboard'); return; }

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
    if (!state.lastChoice || !activeModule || lastSelectedNode === null) return;

    const newItem: GameHistoryItem = { 
      beliefKey: state.lastChoice.beliefKey, 
      sensation, 
      latency: state.lastChoice.latency,
      nodeId: state.currentId,
      domain: activeModule as DomainType,
      choicePosition: state.lastChoice.position
    };
    
    const updatedNodes = commitUpdate(newItem, lastSelectedNode);

    if (sensation === 's0') {
         advanceNode(updatedNodes);
    } else {
        setView('reflection');
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
           advanceNode(updatedNodes);
        }, 1200);
    }
  }, [state.lastChoice, activeModule, lastSelectedNode, advanceNode, setView, state.currentId, commitUpdate]);

  const handleChoice = useCallback((choice: Choice) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); 
    const now = performance.now();
    
    const rawLatency = now - nodeStartTime.current - totalPausedTime.current;
    const cleanLatency = Math.max(0, rawLatency - hardwareLatencyOffset.current);
    
    const choiceWithLatency: ChoiceWithLatency = { ...choice, latency: cleanLatency };
    
    if (activeModule && lastSelectedNode !== null) {
        const currentScene = MODULE_REGISTRY[activeModule][state.currentId];
        const numericId = parseInt(state.currentId);
        const shouldSample = numericId < ONBOARDING_NODES_COUNT || currentScene.intensity >= 4;

        setState(prev => ({ ...prev, lastChoice: choiceWithLatency }));
        if (shouldSample) setView('body_sync');
        else {
             const newItem: GameHistoryItem = { 
                 beliefKey: choice.beliefKey, 
                 sensation: 's0', 
                 latency: cleanLatency,
                 nodeId: state.currentId,
                 domain: activeModule as DomainType,
                 choicePosition: choice.position
             };
             const updatedNodes = commitUpdate(newItem, lastSelectedNode);
             advanceNode(updatedNodes);
        }
    }
  }, [activeModule, state.currentId, lastSelectedNode, advanceNode, setView, commitUpdate]);

  const forceCompleteAll = useCallback(() => {
    const allIds = Array.from({ length: TOTAL_NODES }, (_, i) => i);
    
    const neutralHistory: GameHistoryItem[] = allIds.map(id => {
        let domain: DomainType = 'foundation';
        for (const d of DOMAIN_SETTINGS) {
            if (id >= d.startId && id < (d.startId + d.count)) {
                domain = d.key;
                break;
            }
        }
        return {
            beliefKey: 'default',
            sensation: 's0',
            latency: 1500, // Neutral latency baseline
            nodeId: id.toString(),
            domain: domain,
            choicePosition: -1 // Skipped
        };
    });

    setHistory(neutralHistory);
    setCompletedNodeIds(allIds);
    const sessionState: SessionState = { nodes: allIds, history: neutralHistory };
    StorageService.save(STORAGE_KEYS.SESSION_STATE, sessionState);
    
  }, [setHistory, setCompletedNodeIds]);

  return { state, setHistory, startNode, handleChoice, syncBodySensation, forceCompleteAll };
};