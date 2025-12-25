
export const STORAGE_KEYS = {
  LANG: 'app_lang',
  SESSION: 'session_auth',
  NODES: 'genesis_completed_nodes',
  HISTORY: 'genesis_history',
  VERSION: 'genesis_version',
  ROADMAP_STATE: 'genesis_roadmap_completed'
} as const;

export const StorageService = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage Save Error:', e);
    }
  },
  
  load: <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`Storage Load Error for ${key}, resetting to fallback.`);
      return fallback;
    }
  },
  
  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.LANG) {
        localStorage.removeItem(key);
      }
    });
  }
};
