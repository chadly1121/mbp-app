import { describe, it, expect } from 'vitest';
import { 
  isActionItemOverdue, 
  getActionItemPriorityColor,
  getActionItemStatusColor,
  ACTION_ITEM_CATEGORIES,
  ACTION_ITEM_PRIORITIES,
  ACTION_ITEM_STATUSES
} from '@/types/actionItems';

describe('actionItems types and utilities', () => {
  describe('isActionItemOverdue', () => {
    it('should return false for null due date', () => {
      expect(isActionItemOverdue(null, 'pending')).toBe(false);
    });

    it('should return false for completed status', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isActionItemOverdue(pastDate.toISOString(), 'completed')).toBe(false);
    });

    it('should return true for past due date with pending status', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isActionItemOverdue(pastDate.toISOString(), 'pending')).toBe(true);
    });

    it('should return false for future due date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isActionItemOverdue(futureDate.toISOString(), 'pending')).toBe(false);
    });
  });

  describe('getActionItemPriorityColor', () => {
    it('should return correct colors for priorities', () => {
      expect(getActionItemPriorityColor('critical')).toBe('destructive');
      expect(getActionItemPriorityColor('high')).toBe('orange');
      expect(getActionItemPriorityColor('medium')).toBe('yellow');
      expect(getActionItemPriorityColor('low')).toBe('green');
    });
  });

  describe('getActionItemStatusColor', () => {
    it('should return correct colors for statuses', () => {
      expect(getActionItemStatusColor('completed')).toBe('green');
      expect(getActionItemStatusColor('in_progress')).toBe('blue');
      expect(getActionItemStatusColor('pending')).toBe('gray');
      expect(getActionItemStatusColor('cancelled')).toBe('red');
    });
  });

  describe('constants', () => {
    it('should have correct categories', () => {
      expect(ACTION_ITEM_CATEGORIES).toEqual([
        'Strategic',
        'Financial',
        'Operations', 
        'Marketing',
        'Technology',
        'HR'
      ]);
    });

    it('should have correct priorities', () => {
      expect(ACTION_ITEM_PRIORITIES).toEqual([
        'low',
        'medium',
        'high', 
        'critical'
      ]);
    });

    it('should have correct statuses', () => {
      expect(ACTION_ITEM_STATUSES).toEqual([
        'pending',
        'in_progress',
        'completed',
        'cancelled'
      ]);
    });
  });
});