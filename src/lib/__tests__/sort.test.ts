import { describe, it, expect } from 'vitest';
import { safeDate, safeSort, cmpByDue, cmpByPriority } from '../../lib/sort';

describe('safeDate', () => {
  it('handles null/invalid/valid', () => {
    expect(safeDate(null)).toBe(Number.POSITIVE_INFINITY);
    expect(safeDate('invalid')).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isFinite(safeDate(new Date()))).toBe(true);
  });
});

describe('comparators', () => {
  const items = [
    { priority: 'low' as const, target_date: '2099-01-01' },
    { priority: 'critical' as const, target_date: '' },
    { priority: 'high' as const, target_date: '2000-01-01' },
    { priority: null, target_date: null },
  ];
  it('priority order stable', () => {
    const r = safeSort(items, cmpByPriority);
    expect(r[0].priority).toBe('critical');
  });
  it('due date puts invalid last', () => {
    const r = safeSort(items, cmpByDue);
    expect(r[0].target_date).toBe('2000-01-01');
    expect(r[r.length - 1]?.target_date).toBe(null);
  });
});