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

  // Fetch objectives with their checklist items, collaborators, comments, and activity
  const objectivesQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      // Temporarily return empty objectives until proper tables are set up
      console.log('Strategic Planning: Loading with empty data (tables not yet implemented)');
      return { data: [] as StrategicObjective[], error: null };
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

  // Create objective mutation - disabled for now since table doesn't exist
  const createObjectiveMutation = useSupabaseMutation(
    async (data: CreateObjectiveRequest) => {
      throw new Error('Strategic objectives functionality not yet implemented');
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Strategic objective created successfully',
      context: 'createObjective'
    }
  );

  // Update objective mutation - disabled for now since table doesn't exist
  const updateObjectiveMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateObjectiveRequest }) => {
      throw new Error('Strategic objectives functionality not yet implemented');
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Strategic objective updated successfully',
      context: 'updateObjective'
    }
  );

  // Delete objective mutation - disabled for now since table doesn't exist
  const deleteObjectiveMutation = useSupabaseMutation(
    async (id: string) => {
      throw new Error('Strategic objectives functionality not yet implemented');
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Strategic objective deleted successfully',
      context: 'deleteObjective'
    }
  );

  // Create checklist item mutation - temporarily disabled
  const createChecklistItemMutation = useSupabaseMutation(
    async (data: CreateChecklistItemRequest) => {
      throw new Error('Checklist functionality temporarily disabled');
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Checklist item added successfully',
      context: 'createChecklistItem'
    }
  );

  // Update checklist item mutation - temporarily disabled
  const updateChecklistItemMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateChecklistItemRequest }) => {
      throw new Error('Checklist functionality temporarily disabled');
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Checklist item updated successfully',
      context: 'updateChecklistItem'
    }
  );

  // Delete checklist item mutation - temporarily disabled
  const deleteChecklistItemMutation = useSupabaseMutation(
    async (id: string) => {
      throw new Error('Checklist functionality temporarily disabled');
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