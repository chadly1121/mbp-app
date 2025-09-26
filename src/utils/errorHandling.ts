import { ApiError, ApiResponse } from '@/types/common';

// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const createApiError = (
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ApiError => ({
  message,
  code,
  details,
});

export const createApiResponse = <T>(
  data?: T,
  error?: ApiError
): ApiResponse<T> => ({
  data,
  error,
  success: !error,
});

// Error message normalizer
export const normalizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
};

// Supabase error handler
export const handleSupabaseError = (error: unknown): ApiError => {
  const message = normalizeError(error);
  
  // Common Supabase error patterns
  if (message.includes('JWT')) {
    return createApiError('Authentication expired. Please sign in again.', 'AUTH_EXPIRED');
  }
  
  if (message.includes('RLS')) {
    return createApiError('Access denied. You do not have permission to perform this action.', 'ACCESS_DENIED');
  }
  
  if (message.includes('duplicate key')) {
    return createApiError('This record already exists.', 'DUPLICATE_RECORD');
  }
  
  if (message.includes('foreign key')) {
    return createApiError('Related record not found.', 'INVALID_REFERENCE');
  }
  
  return createApiError(message, 'DATABASE_ERROR');
};

// Development vs Production error handling
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  }
  // In production, you might want to send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
};

// Generic async error handler
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<ApiResponse<T>> => {
  try {
    const data = await fn();
    return createApiResponse(data);
  } catch (error) {
    logError(error, context);
    return createApiResponse(undefined, handleSupabaseError(error));
  }
};