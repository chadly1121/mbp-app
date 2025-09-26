import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import {
  StrategicObjective,
  ChecklistItem,
  CreateObjectiveRequest,
  UpdateObjectiveRequest,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
} from '@/types/strategicPlanning';

export const useStrategicPlanning = () => {
  const { currentCompany } = useCompany();

  // Fetch objectives with their checklist items
  const objectivesQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      // Fetch objectives
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (objectivesError) throw objectivesError;

      // Fetch checklist items for all objectives
      const objectiveIds = objectivesData?.map(obj => obj.id) || [];
      let checklistData: any[] = [];

      if (objectiveIds.length > 0) {
        const { data: checklistResponse, error: checklistError } = await supabase
          .from('strategic_objective_checklist')
          .select('*')
          .in('objective_id', objectiveIds)
          .order('sort_order', { ascending: true });

        if (checklistError) throw checklistError;
        checklistData = checklistResponse || [];
      }

      // Combine objectives with their checklist items  
      const objectives: StrategicObjective[] = (objectivesData || []).map(objective => {
        const checklistItems = checklistData.filter(item => item.objective_id === objective.id);
        const completedItems = checklistItems.filter(item => item.is_completed).length;
        const totalItems = checklistItems.length;
        const calculatedCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        return {
          id: objective.id,
          title: objective.title,
          description: objective.description || null,
          target_date: objective.target_date || null,
          status: (objective.status as StrategicObjective['status']) || 'not_started',
          priority: (objective.priority as StrategicObjective['priority']) || 'medium', 
          completion_percentage: calculatedCompletion, // Use calculated value instead of stored value
          company_id: objective.company_id,
          created_at: objective.created_at,
          updated_at: objective.updated_at,
          checklist: checklistItems.map(item => ({
            ...item,
            company_id: objective.company_id // Add company_id to checklist items
          }))
        };
      });

      return { data: objectives, error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useStrategicPlanning'
    }
  );

  // Statistics
  const stats = useMemo(() => {
    const objectives = objectivesQuery.data || [];
    return {
      total: objectives.length,
      completed: objectives.filter(obj => obj.status === 'completed').length,
      inProgress: objectives.filter(obj => obj.status === 'in_progress').length,
      notStarted: objectives.filter(obj => obj.status === 'not_started').length,
      onHold: objectives.filter(obj => obj.status === 'on_hold').length,
      averageProgress: objectives.length > 0
        ? Math.round(objectives.reduce((sum, obj) => sum + obj.completion_percentage, 0) / objectives.length)
        : 0
    };
  }, [objectivesQuery.data]);

  // Create objective mutation
  const createObjectiveMutation = useSupabaseMutation(
    async (data: CreateObjectiveRequest) => {
      return supabase
        .from('strategic_objectives')
        .insert([data])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Strategic objective created successfully',
      context: 'createObjective'
    }
  );

  // Update objective mutation
  const updateObjectiveMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateObjectiveRequest }) => {
      return supabase
        .from('strategic_objectives')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Strategic objective updated successfully',
      context: 'updateObjective'
    }
  );

  // Delete objective mutation
  const deleteObjectiveMutation = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('strategic_objectives')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Strategic objective deleted successfully',
      context: 'deleteObjective'
    }
  );

  // Create checklist item mutation
  const createChecklistItemMutation = useSupabaseMutation(
    async (data: CreateChecklistItemRequest) => {
      return supabase
        .from('strategic_objective_checklist')
        .insert([data])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Checklist item added successfully',
      context: 'createChecklistItem'
    }
  );

  // Update checklist item mutation
  const updateChecklistItemMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateChecklistItemRequest }) => {
      return supabase
        .from('strategic_objective_checklist')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Checklist item updated successfully',
      context: 'updateChecklistItem'
    }
  );

  // Delete checklist item mutation
  const deleteChecklistItemMutation = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('strategic_objective_checklist')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Checklist item deleted successfully',
      context: 'deleteChecklistItem'
    }
  );

  return {
    // Data
    objectives: objectivesQuery.data || [],
    stats,

    // Loading states
    loading: objectivesQuery.loading,
    error: objectivesQuery.error,

    // Actions
    refetch: objectivesQuery.refetch,
    createObjective: createObjectiveMutation.mutate,
    updateObjective: updateObjectiveMutation.mutate,
    deleteObjective: deleteObjectiveMutation.mutate,
    createChecklistItem: createChecklistItemMutation.mutate,
    updateChecklistItem: updateChecklistItemMutation.mutate,
    deleteChecklistItem: deleteChecklistItemMutation.mutate,

    // Mutation states
    creating: createObjectiveMutation.loading,
    updating: updateObjectiveMutation.loading,
    deleting: deleteObjectiveMutation.loading,
    creatingItem: createChecklistItemMutation.loading,
    updatingItem: updateChecklistItemMutation.loading,
    deletingItem: deleteChecklistItemMutation.loading,
  };
};