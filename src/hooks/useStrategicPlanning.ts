import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import {
  StrategicObjective,
  ChecklistItem,
  ChecklistSubItem,
  CreateObjectiveRequest,
  UpdateObjectiveRequest,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
  CreateSubItemRequest,
  UpdateSubItemRequest,
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
      let collaboratorsData: any[] = [];
      let commentsData: any[] = [];
      let activityData: any[] = [];

      if (objectiveIds.length > 0) {
        const [checklistResponse, subitemsResponse, collaboratorsResponse, commentsResponse, activityResponse] = await Promise.all([
          supabase
            .from('strategic_objective_checklist')
            .select('*')
            .in('objective_id', objectiveIds)
            .order('sort_order', { ascending: true }),
          supabase
            .from('objective_checklist_subitems')
            .select('*')
            .order('sort_order', { ascending: true }),
          supabase
            .from('strategic_objective_collaborators')
            .select('*')
            .in('objective_id', objectiveIds)
            .order('created_at', { ascending: false }),
          supabase
            .from('strategic_objective_comments')
            .select('*')
            .in('objective_id', objectiveIds)
            .order('created_at', { ascending: false }),
          supabase
            .from('strategic_objective_activity')
            .select('*')
            .in('objective_id', objectiveIds)
            .order('created_at', { ascending: false })
        ]);

        if (checklistResponse.error) throw checklistResponse.error;
        if (subitemsResponse.error) throw subitemsResponse.error;
        if (collaboratorsResponse.error) throw collaboratorsResponse.error;
        if (commentsResponse.error) throw commentsResponse.error;
        if (activityResponse.error) throw activityResponse.error;

        checklistData = checklistResponse.data || [];
        const subitemsData = subitemsResponse.data || [];
        collaboratorsData = collaboratorsResponse.data || [];
        commentsData = commentsResponse.data || [];
        activityData = activityResponse.data || [];

        // Add subitems to checklist items
        checklistData = checklistData.map(item => ({
          ...item,
          subitems: subitemsData.filter(subitem => subitem.parent_item_id === item.id)
        }));
      }

      // Combine objectives with their related data
      const objectives: StrategicObjective[] = (objectivesData || []).map(objective => {
        const checklistItems = checklistData.filter(item => item.objective_id === objective.id);
        
        // Calculate completion including sub-items
        let totalItems = 0;
        let completedItems = 0;
        
        checklistItems.forEach(item => {
          totalItems += 1; // Count the main item
          if (item.is_completed) completedItems += 1;
          
          // Count sub-items
          if (item.subitems?.length > 0) {
            totalItems += item.subitems.length;
            completedItems += item.subitems.filter(sub => sub.is_completed).length;
          }
        });
        
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
          })),
          collaborators: collaboratorsData.filter(collab => collab.objective_id === objective.id),
          comments: commentsData.filter(comment => comment.objective_id === objective.id),
          activity: activityData.filter(act => act.objective_id === objective.id)
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

  // Add collaborator mutation
  const addCollaboratorMutation = useSupabaseMutation(
    async (request: CreateCollaboratorRequest) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('strategic_objective_collaborators')
        .insert({
          ...request,
          company_id: currentCompany.id,
          invited_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('strategic_objective_activity').insert({
        objective_id: request.objective_id,
        activity_type: 'shared',
        activity_description: `Invited ${request.user_email} as ${request.role.replace('_', ' ')}`,
        user_email: user.email,
        user_name: user.user_metadata?.display_name || user.email || 'Unknown User',
        company_id: currentCompany.id
      });

      // Get objective details for email
      const { data: objective } = await supabase
        .from('strategic_objectives')
        .select('title, description')
        .eq('id', request.objective_id)
        .single();

      // Send email invitation
      try {
        const session = await supabase.auth.getSession();
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-collaboration-invite', {
          body: {
            email: request.user_email,
            role: request.role,
            objectiveTitle: objective?.title || 'Strategic Objective',
            objectiveDescription: objective?.description,
            inviterName: user.user_metadata?.display_name || user.email || 'Team Member',
            inviterEmail: user.email || '',
            companyName: currentCompany.name || 'Your Company',
            collaboratorId: data.id
          },
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`
          }
        });

        if (emailError) {
          console.error('Failed to send email:', emailError);
          // Don't throw error - collaboration was created successfully
        } else {
          console.log('Email sent successfully:', emailResult);
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw error - collaboration was created successfully
      }
      
      return { data, error: null };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Collaborator invited and email sent successfully',
      context: 'addCollaborator'
    }
  );

  // Remove collaborator mutation
  const removeCollaboratorMutation = useSupabaseMutation(
    async (collaboratorId: string) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Get collaborator details before deletion for activity log
      const { data: collaborator } = await supabase
        .from('strategic_objective_collaborators')
        .select('user_email, role, objective_id')
        .eq('id', collaboratorId)
        .single();
      
      const { error } = await supabase
        .from('strategic_objective_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      // Log activity
      if (collaborator) {
        await supabase.from('strategic_objective_activity').insert({
          objective_id: collaborator.objective_id,
          activity_type: 'unshared',
          activity_description: `Removed ${collaborator.user_email} (${collaborator.role.replace('_', ' ')}) from collaboration`,
          user_email: user.email,
          user_name: user.user_metadata?.display_name || user.email || 'Unknown User',
          company_id: currentCompany.id
        });
      }
      
      return { data: null, error: null };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Collaborator removed successfully',
      context: 'removeCollaborator'
    }
  );

  // Add comment mutation
  const addCommentMutation = useSupabaseMutation(
    async (request: CreateCommentRequest) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('strategic_objective_comments')
        .insert({
          ...request,
          company_id: currentCompany.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.display_name || user.email || 'Unknown User'
        });

      // Log activity
      if (!error) {
        await supabase.from('strategic_objective_activity').insert({
          objective_id: request.objective_id,
          activity_type: 'commented',
          activity_description: `Added a comment`,
          user_email: user.email,
          user_name: user.user_metadata?.display_name || user.email || 'Unknown User',
          company_id: currentCompany.id
        });
      }
      
      return { data, error };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Comment added successfully',
      context: 'addComment'
    }
  );

  // Create subitem mutation
  const createSubItemMutation = useSupabaseMutation(
    async (data: CreateSubItemRequest) => {
      const { data: result, error } = await supabase
        .from('objective_checklist_subitems')
        .insert({
          parent_item_id: data.parent_item_id,
          title: data.title,
          sort_order: data.sort_order || 1,
          company_id: currentCompany?.id
        });

      return { data: result, error };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Sub-step added successfully',
      context: 'createSubItem'
    }
  );

  // Update subitem mutation
  const updateSubItemMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateSubItemRequest }) => {
      const { data: result, error } = await supabase
        .from('objective_checklist_subitems')
        .update(data)
        .eq('id', id);

      return { data: result, error };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Sub-step updated successfully',
      context: 'updateSubItem'
    }
  );

  // Delete subitem mutation
  const deleteSubItemMutation = useSupabaseMutation(
    async (id: string) => {
      const { data: result, error } = await supabase
        .from('objective_checklist_subitems')
        .delete()
        .eq('id', id);

      return { data: result, error };
    },
    {
      onSuccess: () => {
        objectivesQuery.refetch();
      },
      successMessage: 'Sub-step deleted successfully',
      context: 'deleteSubItem'
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
    createSubItem: createSubItemMutation.mutate,
    updateSubItem: updateSubItemMutation.mutate,
    deleteSubItem: deleteSubItemMutation.mutate,
    addCollaborator: addCollaboratorMutation.mutate,
    addComment: addCommentMutation.mutate,
    removeCollaborator: removeCollaboratorMutation.mutate,

    // Mutation states
    creating: createObjectiveMutation.loading,
    updating: updateObjectiveMutation.loading,
    deleting: deleteObjectiveMutation.loading,
    creatingItem: createChecklistItemMutation.loading,
    updatingItem: updateChecklistItemMutation.loading,
    deletingItem: deleteChecklistItemMutation.loading,
    creatingSubItem: createSubItemMutation.loading,
    updatingSubItem: updateSubItemMutation.loading,
    deletingSubItem: deleteSubItemMutation.loading,
    addingCollaborator: addCollaboratorMutation.loading,
    addingComment: addCommentMutation.loading,
    removingCollaborator: removeCollaboratorMutation.loading,
  };
};