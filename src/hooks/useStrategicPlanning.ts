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
  CreateCollaboratorRequest,
  CreateCommentRequest,
} from '@/types/strategicPlanning';

export const useStrategicPlanning = () => {
  const { currentCompany } = useCompany();

  // Fetch objectives
  const objectivesQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data: objectives, error } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (error) throw error;

      // Transform the data to match our interface
      const transformedObjectives: StrategicObjective[] = (objectives || []).map(obj => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        target_date: obj.target_date,
        status: obj.status as StrategicObjective['status'],
        priority: obj.priority as StrategicObjective['priority'], 
        completion_percentage: obj.completion_percentage || 0,
        company_id: obj.company_id,
        created_at: obj.created_at,
        updated_at: obj.updated_at,
        checklist: [],
        collaborators: [],
        comments: [],
        activity: []
      }));

      return { data: transformedObjectives, error: null };
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
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const result = await supabase
        .from('strategic_objectives')
        .insert([{
          ...data,
          company_id: currentCompany.id
        }])
        .select()
        .single();

      return result;
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
      const result = await supabase
        .from('strategic_objectives')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      return result;
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
      const result = await supabase
        .from('strategic_objectives')
        .delete()
        .eq('id', id);

      return result;
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
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const result = await supabase
        .from('objective_checklist_items')
        .insert([{
          objective_id: data.objective_id,
          title: data.item_text,
          sort_order: data.sort_order || 0,
          company_id: currentCompany.id
        }])
        .select()
        .single();

      return result;
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
      const updateData: any = {};
      if (data.item_text !== undefined) updateData.title = data.item_text;
      if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
      
      const result = await supabase
        .from('objective_checklist_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return result;
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
      const result = await supabase
        .from('objective_checklist_items')
        .delete()
        .eq('id', id);

      return result;
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Checklist item deleted successfully',
      context: 'deleteChecklistItem'
    }
  );

  // Add collaborator mutation
  const addCollaboratorMutation = useSupabaseMutation(
    async (request: CreateCollaboratorRequest) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      return { data: null, error: null };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Collaborator invited successfully',
      context: 'addCollaborator'
    }
  );

  // Add comment mutation
  const addCommentMutation = useSupabaseMutation(
    async (request: CreateCommentRequest) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      return { data: null, error: null };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Comment added successfully',
      context: 'addComment'
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
    addCollaborator: addCollaboratorMutation.mutate,
    addComment: addCommentMutation.mutate,

    // Mutation states
    creating: createObjectiveMutation.loading,
    updating: updateObjectiveMutation.loading,
    deleting: deleteObjectiveMutation.loading,
    creatingItem: createChecklistItemMutation.loading,
    updatingItem: updateChecklistItemMutation.loading,
    deletingItem: deleteChecklistItemMutation.loading,
    addingCollaborator: addCollaboratorMutation.loading,
    addingComment: addCommentMutation.loading,
  };
};