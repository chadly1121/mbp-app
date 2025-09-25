import { useCallback, useMemo } from 'react';

// Performance utility hooks and functions
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized filter functions for common use cases
export const useFilteredData = <T>(
  data: T[],
  filters: Record<string, string | number | boolean>,
  filterFn: (item: T, filters: Record<string, string | number | boolean>) => boolean
) => {
  return useMemo(() => {
    if (!data.length) return [];
    
    // If no filters are active, return all data
    const hasActiveFilters = Object.values(filters).some(filter => 
      filter !== 'all' && filter !== '' && filter !== null && filter !== undefined
    );
    
    if (!hasActiveFilters) return data;
    
    return data.filter(item => filterFn(item, filters));
  }, [data, filters, filterFn]);
};

// Common filter functions
export const createStatusFilter = <T extends { status: string }>(
  statusFilter: string
) => (item: T) => statusFilter === 'all' || item.status === statusFilter;

export const createPriorityFilter = <T extends { priority: string }>(
  priorityFilter: string
) => (item: T) => priorityFilter === 'all' || item.priority === priorityFilter;

export const createCategoryFilter = <T extends { category?: string }>(
  categoryFilter: string
) => (item: T) => categoryFilter === 'all' || item.category === categoryFilter;

// Batch operations helper
export const useBatchOperations = () => {
  const executeBatch = useCallback(async <T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 5
  ) => {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch.map(op => op()));
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[i + index] = result.value;
        } else {
          console.error(`Batch operation ${i + index} failed:`, result.reason);
        }
      });
    }
    
    return results;
  }, []);

  return { executeBatch };
};

// Memoized sort functions
export const useSortedData = <T>(
  data: T[],
  sortKey: keyof T | null,
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  return useMemo(() => {
    if (!sortKey || !data.length) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);
};

// Performance measurement utilities
export const measurePerformance = (label: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const end = performance.now();
      console.log(`${label} took ${end - start} milliseconds`);
      return end - start;
    }
  };
};

// React imports need to be added
import { useState, useEffect } from 'react';