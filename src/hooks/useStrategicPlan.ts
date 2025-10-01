import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import {
  LongTermStrategy,
  AnnualStrategicGoals,
  QuarterlyStrategicGoals,
  CreateLongTermStrategyRequest,
  UpdateLongTermStrategyRequest,
  CreateAnnualGoalsRequest,
  UpdateAnnualGoalsRequest,
  CreateQuarterlyGoalsRequest,
  UpdateQuarterlyGoalsRequest,
  CompanyValue,
} from '@/types/strategicPlan';

export const useStrategicPlan = () => {
  const { currentCompany } = useCompany();

  // Fetch long-term strategy
  const longTermQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('long_term_strategy')
        .select('*')
        .eq('company_id', currentCompany.id)
        .maybeSingle();

      if (error) throw error;

      // Transform database JSON types to typed arrays
      const typedData = data ? {
        ...data,
        values_json: (data.values_json || []) as unknown as CompanyValue[],
        tactics_json: (data.tactics_json || []) as unknown as string[],
      } as LongTermStrategy : null;

      return { data: typedData, error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useLongTermStrategy'
    }
  );

  // Fetch annual goals
  const annualGoalsQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('annual_strategic_goals')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('fiscal_year', { ascending: false });

      if (error) throw error;

      return { data: (data as AnnualStrategicGoals[]) || [], error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useAnnualGoals'
    }
  );

  // Fetch quarterly goals
  const quarterlyGoalsQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('quarterly_strategic_goals')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('year', { ascending: false })
        .order('quarter', { ascending: true });

      if (error) throw error;

      return { data: (data as QuarterlyStrategicGoals[]) || [], error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useQuarterlyGoals'
    }
  );

  // Create/Update long-term strategy
  const saveLongTermMutation = useSupabaseMutation(
    async (data: CreateLongTermStrategyRequest | UpdateLongTermStrategyRequest) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      // Cast arrays to Json type for Supabase
      const dbData = {
        ...data,
        values_json: data.values_json as any,
        tactics_json: data.tactics_json as any,
      };

      if (longTermQuery.data?.id) {
        return supabase
          .from('long_term_strategy')
          .update(dbData)
          .eq('id', longTermQuery.data.id)
          .select()
          .single();
      } else {
        return supabase
          .from('long_term_strategy')
          .insert([{ ...dbData, company_id: currentCompany.id }])
          .select()
          .single();
      }
    },
    {
      onSuccess: () => {
        longTermQuery.refetch();
      },
      successMessage: 'Long-term strategy saved successfully',
      context: 'saveLongTermStrategy'
    }
  );

  // Create annual goals
  const createAnnualGoalsMutation = useSupabaseMutation(
    async (data: CreateAnnualGoalsRequest) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const dbData = {
        ...data,
        implementation_items_json: data.implementation_items_json as any,
      };

      return supabase
        .from('annual_strategic_goals')
        .insert([{ ...dbData, company_id: currentCompany.id }])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        annualGoalsQuery.refetch();
      },
      successMessage: 'Annual goals created successfully',
      context: 'createAnnualGoals'
    }
  );

  // Update annual goals
  const updateAnnualGoalsMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateAnnualGoalsRequest }) => {
      const dbData = {
        ...data,
        implementation_items_json: data.implementation_items_json as any,
      };

      return supabase
        .from('annual_strategic_goals')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        annualGoalsQuery.refetch();
      },
      successMessage: 'Annual goals updated successfully',
      context: 'updateAnnualGoals'
    }
  );

  // Create quarterly goals
  const createQuarterlyGoalsMutation = useSupabaseMutation(
    async (data: CreateQuarterlyGoalsRequest) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const dbData = {
        ...data,
        implementation_items_json: data.implementation_items_json as any,
      };

      return supabase
        .from('quarterly_strategic_goals')
        .insert([{ ...dbData, company_id: currentCompany.id }])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        quarterlyGoalsQuery.refetch();
      },
      successMessage: 'Quarterly goals created successfully',
      context: 'createQuarterlyGoals'
    }
  );

  // Update quarterly goals
  const updateQuarterlyGoalsMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateQuarterlyGoalsRequest }) => {
      const dbData = {
        ...data,
        implementation_items_json: data.implementation_items_json as any,
      };

      return supabase
        .from('quarterly_strategic_goals')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        quarterlyGoalsQuery.refetch();
      },
      successMessage: 'Quarterly goals updated successfully',
      context: 'updateQuarterlyGoals'
    }
  );

  return {
    // Data
    longTermStrategy: longTermQuery.data,
    annualGoals: annualGoalsQuery.data || [],
    quarterlyGoals: quarterlyGoalsQuery.data || [],

    // Loading states
    loading: longTermQuery.loading || annualGoalsQuery.loading || quarterlyGoalsQuery.loading,
    
    // Actions
    refetch: () => {
      longTermQuery.refetch();
      annualGoalsQuery.refetch();
      quarterlyGoalsQuery.refetch();
    },
    saveLongTerm: saveLongTermMutation.mutate,
    createAnnualGoals: createAnnualGoalsMutation.mutate,
    updateAnnualGoals: updateAnnualGoalsMutation.mutate,
    createQuarterlyGoals: createQuarterlyGoalsMutation.mutate,
    updateQuarterlyGoals: updateQuarterlyGoalsMutation.mutate,

    // Mutation states
    saving: saveLongTermMutation.loading || createAnnualGoalsMutation.loading || 
            updateAnnualGoalsMutation.loading || createQuarterlyGoalsMutation.loading || 
            updateQuarterlyGoalsMutation.loading,
  };
};
