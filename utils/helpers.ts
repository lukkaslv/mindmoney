
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

// Safe deep object property access with enhanced error reporting
export const resolvePath = (obj: Record<string, any>, path: string): string => {
  if (!obj) return `[ROOT_MISSING]`;
  if (!path) return `[PATH_EMPTY]`;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation path error: "${key}" not found in path "${path}"`);
      return `[KEY_ERROR: ${key}]`;
    }
  }
  
  if (typeof current === 'string') return current;
  if (typeof current === 'object' && current !== null) {
    // If we resolved to an object but expected a string (like a task object)
    return `[OBJECT_ERROR: ${path}]`;
  }
  
  return `[TYPE_ERROR: ${path}]`;
};
