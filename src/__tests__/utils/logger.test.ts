import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel } from '@/utils/logger';

describe('Logger', () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages in development', () => {
    // Mock development environment
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: true },
      configurable: true
    });

    logger.debug('Test debug message');
    expect(console.log).toHaveBeenCalledWith('[DEBUG] Test debug message');
  });

  it('should not log debug messages in production', () => {
    // Mock production environment  
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: false },
      configurable: true
    });

    logger.debug('Test debug message');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should always log error messages', () => {
    logger.error('Test error message', new Error('test'));
    expect(console.error).toHaveBeenCalledWith(
      '[ERROR] Test error message',
      expect.any(Error)
    );
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message');
  });
});