// Utility functions for array operations to eliminate anti-patterns

export const hasItems = <T>(array: T[] | null | undefined): array is T[] => {
  return Array.isArray(array) && array.length > 0;
};

export const isEmpty = <T>(array: T[] | null | undefined): boolean => {
  return !Array.isArray(array) || array.length === 0;
};

export const safeArray = <T>(array: T[] | null | undefined): T[] => {
  return Array.isArray(array) ? array : [];
};

export const calculateAverage = (numbers: number[]): number => {
  if (!hasItems(numbers)) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const unique = <T>(array: T[], keyFn?: (item: T) => string | number): T[] => {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};