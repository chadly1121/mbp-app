import { describe, it, expect } from 'vitest';
import { 
  hasItems, 
  isEmpty, 
  safeArray, 
  calculateAverage, 
  groupBy, 
  unique 
} from '@/utils/arrayHelpers';

describe('arrayHelpers', () => {
  describe('hasItems', () => {
    it('should return true for non-empty arrays', () => {
      expect(hasItems([1, 2, 3])).toBe(true);
      expect(hasItems(['a'])).toBe(true);
    });

    it('should return false for empty arrays', () => {
      expect(hasItems([])).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(hasItems(null)).toBe(false);
      expect(hasItems(undefined)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty arrays, null, or undefined', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty arrays', () => {
      expect(isEmpty([1])).toBe(false);
    });
  });

  describe('safeArray', () => {
    it('should return the array if valid', () => {
      const arr = [1, 2, 3];
      expect(safeArray(arr)).toBe(arr);
    });

    it('should return empty array for null or undefined', () => {
      expect(safeArray(null)).toEqual([]);
      expect(safeArray(undefined)).toEqual([]);
    });
  });

  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculateAverage([2, 4, 6])).toBe(4);
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });
  });

  describe('groupBy', () => {
    it('should group items by key function', () => {
      const items = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 }
      ];
      
      const result = groupBy(items, item => item.type);
      
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
      expect(result.A[0].value).toBe(1);
      expect(result.A[1].value).toBe(3);
    });
  });

  describe('unique', () => {
    it('should remove duplicates from array', () => {
      expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it('should use key function when provided', () => {
      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' }
      ];
      
      const result = unique(items, item => item.id);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('B');
    });
  });
});