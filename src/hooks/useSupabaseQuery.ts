import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleSupabaseError, logError } from '@/utils/errorHandling';

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  onError?: (error: string) => void;
  context?: string;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  dependencies: React.DependencyList = [],
  options: UseSupabaseQueryOptions = {}
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { enabled = true, onError, context } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      
      if (result.error) {
        const apiError = handleSupabaseError(result.error);
        setError(apiError.message);
        
        if (onError) {
          onError(apiError.message);
        } else {
          toast({
            title: 'Error loading data',
            description: apiError.message,
            variant: 'destructive',
          });
        }
      } else {
        setData(result.data);
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err).message;
      logError(err, context);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      } else {
        toast({
          title: 'Unexpected error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, queryFn, onError, context, toast]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Specialized hook for company-dependent queries
export function useCompanyQuery<T>(
  companyId: string | null,
  queryFn: (companyId: string) => Promise<{ data: T; error: any }>,
  dependencies: React.DependencyList = [],
  options: UseSupabaseQueryOptions = {}
): QueryState<T> {
  const wrappedQueryFn = useCallback(async () => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    return queryFn(companyId);
  }, [companyId, queryFn]);

  return useSupabaseQuery(
    wrappedQueryFn,
    [companyId, ...dependencies],
    { ...options, enabled: !!companyId && (options.enabled ?? true) }
  );
}