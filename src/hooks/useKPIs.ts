import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import {
  KPI,
  CreateKPIRequest,
  UpdateKPIRequest,
  KPIStats,
  calculateKPIStats,
} from '@/types/kpis';

export const useKPIs = () => {
  const { currentCompany } = useCompany();

  // Fetch KPIs
  const kpisQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: (data as KPI[]) || [], error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useKPIs'
    }
  );

  // Statistics
  const stats = useMemo(() => {
    const kpis = kpisQuery.data || [];
    return calculateKPIStats(kpis);
  }, [kpisQuery.data]);

  // Create KPI mutation
  const createKPIMutation = useSupabaseMutation(
    async (data: Omit<CreateKPIRequest, 'company_id'>) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      return supabase
        .from('kpis')
        .insert([{ ...data, company_id: currentCompany.id }])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        kpisQuery.refetch();
      },
      successMessage: 'KPI created successfully',
      context: 'createKPI'
    }
  );

  // Update KPI mutation
  const updateKPIMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateKPIRequest }) => {
      return supabase
        .from('kpis')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        kpisQuery.refetch();
      },
      successMessage: 'KPI updated successfully',
      context: 'updateKPI'
    }
  );

  // Delete KPI mutation
  const deleteKPIMutation = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('kpis')
        .update({ is_active: false })
        .eq('id', id);
    },
    {
      onSuccess: () => {
        kpisQuery.refetch();
      },
      successMessage: 'KPI deleted successfully',
      context: 'deleteKPI'
    }
  );

  return {
    // Data
    kpis: kpisQuery.data || [],
    stats,

    // Loading states
    loading: kpisQuery.loading,
    error: kpisQuery.error,

    // Actions
    refetch: kpisQuery.refetch,
    createKPI: createKPIMutation.mutate,
    updateKPI: updateKPIMutation.mutate,
    deleteKPI: deleteKPIMutation.mutate,

    // Mutation states
    creating: createKPIMutation.loading,
    updating: updateKPIMutation.loading,
    deleting: deleteKPIMutation.loading,
  };
};