
import { AnalysisResult, ScanHistory } from '../types';

export const STORAGE_KEYS = {
  LANG: 'app_lang',
  SESSION: 'session_auth',
  NODES: 'genesis_completed_nodes',
  HISTORY: 'genesis_history',
  VERSION: 'genesis_version',
  ROADMAP_STATE: 'genesis_roadmap_completed',
  SCAN_HISTORY: 'genesis_scan_history'
} as const;

// Deterministic Pseudo-Counter for ID-based persistence without Date.now()
let persistenceCounter = 0;

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
      removeItem: (key: string) => { delete memoryStore[key]; }
    };
  }
};

const provider = getStorageProvider();

export const StorageService = {
  save: (key: string, data: unknown) => {
    try {
      provider.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage Persistence Failure:', e);
    }
  },
  
  load: <T,>(key: string, fallback: T): T => {
    try {
      const item = provider.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Data Corruption at ${key}. Reverting to baseline.`);
      return fallback;
    }
  },

  async saveScan(result: AnalysisResult): Promise<void> {
    const history = StorageService.load<ScanHistory>(STORAGE_KEYS.SCAN_HISTORY, { 
      scans: [], 
      latestScan: null, 
      evolutionMetrics: { entropyTrend: [], integrityTrend: [], dates: [] } 
    });
    
    // Deterministic progression marker instead of Date.now()
    persistenceCounter++;
    const deterministicResult = { ...result, createdAt: persistenceCounter };
    
    history.scans.push(deterministicResult);
    history.latestScan = deterministicResult;
    history.evolutionMetrics.entropyTrend.push(deterministicResult.entropyScore);
    history.evolutionMetrics.integrityTrend.push(deterministicResult.integrity);
    history.evolutionMetrics.dates.push(`ID_${persistenceCounter}`);

    StorageService.save(STORAGE_KEYS.SCAN_HISTORY, history);
  },

  getScanHistory(): ScanHistory {
    return StorageService.load<ScanHistory>(STORAGE_KEYS.SCAN_HISTORY, { 
      scans: [], 
      latestScan: null, 
      evolutionMetrics: { entropyTrend: [], integrityTrend: [], dates: [] } 
    });
  },
  
  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.LANG) {
        provider.removeItem(key);
      }
    });
    persistenceCounter = 0;
  }
};
