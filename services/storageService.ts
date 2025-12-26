import { AnalysisResult, ScanHistory, DataCorruptionError } from '../types';

export interface SessionState {
  nodes: number[];
  history: any[]; // Using 'any' to avoid circular dependency issues, should be GameHistoryItem
}

export const STORAGE_KEYS = {
  LANG: 'app_lang',
  SESSION: 'session_auth',
  SESSION_STATE: 'genesis_session_state', // Replaces NODES and HISTORY
  VERSION: 'genesis_version',
  ROADMAP_STATE: 'genesis_roadmap_completed',
  SCAN_HISTORY: 'genesis_scan_history',
  AUDIT_LOG: 'genesis_audit_log'
} as const;

// In-Memory Fallback for sandbox environments (artifacts)
const memoryStore: Record<string, string> = {};

const getStorageProvider = () => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('LocalStorage unavailable. Operating in RAM mode.');
    return {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, val: string) => { memoryStore[key] = val; },
      removeItem: (key: string) => { delete memoryStore[key]; },
      getAllKeys: () => Object.keys(memoryStore),
      clear: () => { 
          for (const key in memoryStore) {
              delete memoryStore[key];
          }
      }
    };
  }
};

const provider = getStorageProvider();

// Helper to safely parse history
const loadHistory = (): ScanHistory => {
  const item = provider.getItem(STORAGE_KEYS.SCAN_HISTORY);
  if (!item) return { 
    scans: [], 
    latestScan: null, 
    evolutionMetrics: { entropyTrend: [], integrityTrend: [], dates: [] } 
  };
  try {
    return JSON.parse(item) as ScanHistory;
  } catch (e) {
    // Unlike session state, scan history can be reset without losing current progress.
    return { 
      scans: [], 
      latestScan: null, 
      evolutionMetrics: { entropyTrend: [], integrityTrend: [], dates: [] } 
    };
  }
};

// Initialize counter based on existing data to enforce determinism across reloads
const initialHistory = loadHistory();
let persistenceCounter = initialHistory.scans.length > 0 
  ? initialHistory.scans.length 
  : 0;

export const StorageService = {
  save: (key: string, data: unknown) => {
    try {
      provider.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage Persistence Failure:', e);
    }
  },
  
  load: <T,>(key: string, fallback: T): T => {
    const item = provider.getItem(key);
    if (!item) return fallback;
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`CRITICAL: Data Corruption at key ${key}.`, e);
      throw new DataCorruptionError(`Failed to parse data for key: ${key}`);
    }
  },

  async saveScan(result: AnalysisResult): Promise<void> {
    const history = loadHistory();
    
    // Deterministic progression marker instead of Date.now()
    persistenceCounter++;
    // This service is the single source of truth for timestamps.
    const deterministicResult: AnalysisResult = { 
        ...result, 
        createdAt: persistenceCounter,
        timestamp: Date.now() // The real-world timestamp is applied here.
    };
    
    history.scans.push(deterministicResult);
    history.latestScan = deterministicResult;
    history.evolutionMetrics.entropyTrend.push(deterministicResult.entropyScore);
    history.evolutionMetrics.integrityTrend.push(deterministicResult.integrity);
    history.evolutionMetrics.dates.push(`ID_${persistenceCounter}`);

    StorageService.save(STORAGE_KEYS.SCAN_HISTORY, history);
  },

  getScanHistory(): ScanHistory {
    return loadHistory();
  },
  
  logAuditEvent: (action: string, details?: Record<string, any>) => {
    try {
        const logs = StorageService.load<any[]>(STORAGE_KEYS.AUDIT_LOG, []);
        const newLog = {
            timestamp: new Date().toISOString(),
            action,
            details: details || {}
        };
        logs.unshift(newLog); // Add to the beginning
        // Keep only the last 50 log entries
        if (logs.length > 50) {
            logs.length = 50;
        }
        StorageService.save(STORAGE_KEYS.AUDIT_LOG, logs);
    } catch (e) {
        console.error("Failed to write to audit log:", e);
    }
  },

  clear: () => {
    // CRITICAL: Preserve audit log and language settings during a wipe.
    const preservedKeys: string[] = [STORAGE_KEYS.LANG, STORAGE_KEYS.AUDIT_LOG];
    
    Object.values(STORAGE_KEYS).forEach(key => {
      if (!preservedKeys.includes(key)) {
        provider.removeItem(key);
      }
    });
    persistenceCounter = 0;
    StorageService.logAuditEvent("SESSION_WIPE_EXECUTED");
  }
};