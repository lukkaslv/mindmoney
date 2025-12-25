
// Deterministic simple hash for password validation
export const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};

// Safe deep object property access
export const resolvePath = (obj: Record<string, any>, path: string): string => {
  if (!obj || !path) return '[DATA_MISSING]';
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return '[KEY_ERROR]';
    }
  }
  return typeof current === 'string' ? current : '[TYPE_ERROR]';
};
