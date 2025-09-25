import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import { 
  ActionItem, 
  CreateActionItemRequest, 
  UpdateActionItemRequest,
  ActionItemFilters 
} from '@/types/actionItems';

export const useActionItems = (filters?: ActionItemFilters) => {
  const { currentCompany } = useCompany();

  // Fetch action items
  const queryResult = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      return supabase
        .from('action_items')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useActionItems'
    }
  );

  // Filter action items based on provided filters
  const filteredData = useMemo(() => {
    if (!queryResult.data || !filters) return queryResult.data || [];
    
    return (queryResult.data as ActionItem[]).filter(item => {
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
      if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.assigned_to && filters.assigned_to !== 'all' && item.assigned_to !== filters.assigned_to) return false;
      return true;
    });
  }, [queryResult.data, filters]);

  // Create action item mutation
  const createMutation = useSupabaseMutation(
    async (data: CreateActionItemRequest) => {
      return supabase
        .from('action_items')
        .insert([data])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryResult.refetch();
      },
      successMessage: 'Action item created successfully',
      context: 'createActionItem'
    }
  );

  // Update action item mutation  
  const updateMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateActionItemRequest }) => {
      return supabase
        .from('action_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryResult.refetch();
      },
      successMessage: 'Action item updated successfully',
      context: 'updateActionItem'
    }
  );

  // Delete action item mutation
  const deleteMutation = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('action_items')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        queryResult.refetch();
      },
      successMessage: 'Action item deleted successfully',
      context: 'deleteActionItem'
    }
  );

  // Toggle completion status
  const toggleCompletion = (id: string, completed: boolean) => {
    updateMutation.mutate({
      id,
      data: { status: completed ? 'completed' : 'pending' }
    });
  };

  return {
    // Data
    actionItems: queryResult.data as ActionItem[] | null,
    filteredActionItems: filteredData as ActionItem[],
    
    // Loading states
    loading: queryResult.loading,
    error: queryResult.error,
    
    // Actions
    refetch: queryResult.refetch,
    createActionItem: createMutation.mutate,
    updateActionItem: updateMutation.mutate,
    deleteActionItem: deleteMutation.mutate,
    toggleCompletion,
    
    // Mutation states
    creating: createMutation.loading,
    updating: updateMutation.loading,
    deleting: deleteMutation.loading,
  };
};