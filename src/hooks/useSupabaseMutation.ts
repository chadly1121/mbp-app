import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleSupabaseError, logError } from '@/utils/errorHandling';

export interface MutationState<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseSupabaseMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  context?: string;
}

export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData; error: any }>,
  options: UseSupabaseMutationOptions<TData> = {}
): MutationState<TData, TVariables> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { onSuccess, onError, successMessage, context } = options;

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await mutationFn(variables);
        
        if (result.error) {
          const apiError = handleSupabaseError(result.error);
          setError(apiError.message);
          
          if (onError) {
            onError(apiError.message);
          } else {
            toast({
              title: 'Operation failed',
              description: apiError.message,
              variant: 'destructive',
            });
          }
          return undefined;
        }
        
        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        return result.data;
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
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, successMessage, context, toast]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}