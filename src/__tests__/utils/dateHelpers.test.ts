import { describe, it, expect } from 'vitest';
import { 
  getCurrentDateString, 
  formatDateForDisplay, 
  isDateOverdue
} from '@/utils/dateHelpers';

describe('dateHelpers', () => {
  describe('getCurrentDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = getCurrentDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format valid date strings', () => {
      const result = formatDateForDisplay('2024-01-15');
      expect(result).toBe('January 15, 2024');
    });

    it('should handle null/undefined dates', () => {
      expect(formatDateForDisplay(null)).toBe('No date');
      expect(formatDateForDisplay(undefined)).toBe('No date');
    });

    it('should handle invalid dates', () => {
      expect(formatDateForDisplay('invalid')).toBe('Invalid date');
    });
  });

  describe('isDateOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = '2020-01-01';
      expect(isDateOverdue(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = '2030-01-01';
      expect(isDateOverdue(futureDate)).toBe(false);
    });

    it('should return false for null dates', () => {
      expect(isDateOverdue(null)).toBe(false);
    });
  });
});