import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeGetShares, safeSaveShares, getOrCreateToken } from '@/utils/shareUtils';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Share Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('safeGetShares', () => {
    it('should return empty object when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(safeGetShares()).toEqual({});
    });

    it('should parse valid JSON from localStorage', () => {
      const mockData = { '1': { viewer: 'token1', editor: null, accepted: [] } };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      expect(safeGetShares()).toEqual(mockData);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      expect(safeGetShares()).toEqual({});
    });
  });

  describe('safeSaveShares', () => {
    it('should save shares to localStorage', () => {
      const mockData = { '1': { viewer: 'token1', editor: null, accepted: [] } };
      safeSaveShares(mockData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('shares', JSON.stringify(mockData));
    });

    it('should handle JSON stringify errors gracefully', () => {
      // Create circular reference to cause JSON.stringify error
      const circularObj: any = {};
      circularObj.self = circularObj;
      
      expect(() => safeSaveShares(circularObj)).not.toThrow();
    });
  });

  describe('getOrCreateToken', () => {
    it('should create new token when none exists', () => {
      localStorageMock.getItem.mockReturnValue('{}');
      const token = getOrCreateToken('1', 'viewer');
      expect(token).toHaveLength(36); // UUID length
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return existing token when available', () => {
      const existingToken = 'existing-token';
      const mockData = { '1': { viewer: existingToken, editor: null, accepted: [] } };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const token = getOrCreateToken('1', 'viewer');
      expect(token).toBe(existingToken);
    });
  });
});