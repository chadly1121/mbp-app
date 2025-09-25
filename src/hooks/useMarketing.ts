import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { useCompany } from '@/hooks/useCompany';
import {
  MarketingCampaign,
  CreateMarketingCampaignRequest,
  UpdateMarketingCampaignRequest,
  MarketingStats,
  calculateMarketingStats,
} from '@/types/marketing';

export const useMarketing = () => {
  const { currentCompany } = useCompany();

  // Fetch marketing campaigns
  const campaignsQuery = useSupabaseQuery(
    async () => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('marketing_plan')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('campaign_start_date', { ascending: false });

      if (error) throw error;

      return { data: (data as MarketingCampaign[]) || [], error: null };
    },
    [currentCompany?.id],
    {
      enabled: !!currentCompany?.id,
      context: 'useMarketing'
    }
  );

  // Statistics
  const stats = useMemo(() => {
    const campaigns = campaignsQuery.data || [];
    return calculateMarketingStats(campaigns);
  }, [campaignsQuery.data]);

  // Create campaign mutation
  const createCampaignMutation = useSupabaseMutation(
    async (data: Omit<CreateMarketingCampaignRequest, 'company_id'>) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      return supabase
        .from('marketing_plan')
        .insert([{ ...data, company_id: currentCompany.id }])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        campaignsQuery.refetch();
      },
      successMessage: 'Marketing campaign created successfully',
      context: 'createCampaign'
    }
  );

  // Update campaign mutation
  const updateCampaignMutation = useSupabaseMutation(
    async ({ id, data }: { id: string; data: UpdateMarketingCampaignRequest }) => {
      return supabase
        .from('marketing_plan')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        campaignsQuery.refetch();
      },
      successMessage: 'Marketing campaign updated successfully',
      context: 'updateCampaign'
    }
  );

  // Delete campaign mutation
  const deleteCampaignMutation = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('marketing_plan')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        campaignsQuery.refetch();
      },
      successMessage: 'Marketing campaign deleted successfully',
      context: 'deleteCampaign'
    }
  );

  return {
    // Data
    campaigns: campaignsQuery.data || [],
    stats,

    // Loading states
    loading: campaignsQuery.loading,
    error: campaignsQuery.error,

    // Actions
    refetch: campaignsQuery.refetch,
    createCampaign: createCampaignMutation.mutate,
    updateCampaign: updateCampaignMutation.mutate,
    deleteCampaign: deleteCampaignMutation.mutate,

    // Mutation states
    creating: createCampaignMutation.loading,
    updating: updateCampaignMutation.loading,
    deleting: deleteCampaignMutation.loading,
  };
};