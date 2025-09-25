import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import {
  Habit,
  CreateHabitRequest,
  UpdateHabitRequest,
  HabitStats,
  calculateHabitStats,
  groupHabitsByUser,
} from '@/types/habits';

export const useHabits = () => {
  const { currentCompany } = useCompany();

  // Fetch habits
  const habitsQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('habits_tracker')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('date_tracked', { ascending: false });

      if (error) throw error;

      return { data: (data as Habit[]) || [], error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useHabits'
    }
  );

  // Statistics and grouping
  const { stats, groupedHabits } = useMemo(() => {
    const habits = habitsQuery.data || [];
    return {
      stats: calculateHabitStats(habits),
      groupedHabits: groupHabitsByUser(habits)
    };
  }, [habitsQuery.data]);

  // Create habit mutation
  const createHabitMutation = useSupabaseMutation(
    async (data: Omit<CreateHabitRequest, 'company_id'>) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      return supabase
        .from('habits_tracker')
        .insert([{ 
          ...data, 
          company_id: currentCompany.id,
          streak_count: 0
        }])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        habitsQuery.refetch();
      },
      successMessage: 'Habit created successfully',
      context: 'createHabit'
    }
  );

  // Update habit mutation
  const updateHabitMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateHabitRequest }) => {
      return supabase
        .from('habits_tracker')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        habitsQuery.refetch();
      },
      successMessage: 'Habit updated successfully',
      context: 'updateHabit'
    }
  );

  // Toggle habit completion
  const toggleHabitCompletion = async (habitId: string, currentCompleted: boolean) => {
    return updateHabitMutation.mutate({
      id: habitId,
      data: { completed: !currentCompleted }
    });
  };

  // Delete habit mutation
  const deleteHabitMutation = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('habits_tracker')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        habitsQuery.refetch();
      },
      successMessage: 'Habit deleted successfully',
      context: 'deleteHabit'
    }
  );

  return {
    // Data
    habits: habitsQuery.data || [],
    groupedHabits,
    stats,

    // Loading states
    loading: habitsQuery.loading,
    error: habitsQuery.error,

    // Actions
    refetch: habitsQuery.refetch,
    createHabit: createHabitMutation.mutate,
    updateHabit: updateHabitMutation.mutate,
    toggleHabitCompletion,
    deleteHabit: deleteHabitMutation.mutate,

    // Mutation states
    creating: createHabitMutation.loading,
    updating: updateHabitMutation.loading,
    deleting: deleteHabitMutation.loading,
  };
};