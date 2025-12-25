
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

// Abstract storage to handle window.storage (if provided) or localStorage
const getStorage = () => {
  if (typeof (window as any).storage !== 'undefined') {
    return (window as any).storage;
  }
  return {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, val: string) => localStorage.setItem(key, val),
    removeItem: (key: string) => localStorage.removeItem(key)
  };
};

export const StorageService = {
  save: (key: string, data: any) => {
    try {
      getStorage().setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage Save Error:', e);
    }
  },
  
  load: <T,>(key: string, fallback: T): T => {
    try {
      const item = getStorage().getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`Storage Load Error for ${key}, resetting to fallback.`);
      return fallback;
    }
  },

  async saveScan(result: AnalysisResult): Promise<void> {
    // FIX: Using explicit StorageService reference instead of 'this' to avoid generic inference issues in object literals
    const history = StorageService.load<ScanHistory>(STORAGE_KEYS.SCAN_HISTORY, { scans: [], latestScan: null, evolutionMetrics: { entropyTrend: [], integrityTrend: [], dates: [] } });
    
    history.scans.push(result);
    history.latestScan = result;
    history.evolutionMetrics.entropyTrend.push(result.entropyScore);
    history.evolutionMetrics.integrityTrend.push(result.integrity);
    history.evolutionMetrics.dates.push(new Date(result.timestamp).toLocaleDateString());

    this.save(STORAGE_KEYS.SCAN_HISTORY, history);
  },

  getScanHistory(): ScanHistory {
    // FIX: Using explicit StorageService reference instead of 'this'
    return StorageService.load<ScanHistory>(STORAGE_KEYS.SCAN_HISTORY, { scans: [], latestScan: null, evolutionMetrics: { entropyTrend: [], integrityTrend: [], dates: [] } });
  },
  
  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.LANG) {
        getStorage().removeItem(key);
      }
    });
  }
};
