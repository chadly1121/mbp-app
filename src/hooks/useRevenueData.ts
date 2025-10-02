import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';

interface RevenueData {
  totalRevenue: number;
  revenueByMonth: { month: number; amount: number }[];
}

export const useRevenueData = (year: number = 2025) => {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ['revenue-data', currentCompany?.id, year],
    queryFn: async (): Promise<RevenueData> => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      // Query qbo_profit_loss table for revenue data
      const { data, error } = await supabase
        .from('qbo_profit_loss')
        .select('current_month, fiscal_month')
        .eq('company_id', currentCompany.id)
        .eq('fiscal_year', year)
        .eq('account_type', 'revenue')
        .order('fiscal_month', { ascending: true });

      if (error) throw error;

      // Calculate total revenue (sum of all monthly revenue)
      const totalRevenue = data?.reduce((sum, row) => {
        return sum + (Number(row.current_month) || 0);
      }, 0) || 0;

      // Group by month
      const revenueByMonth = data?.map(row => ({
        month: row.fiscal_month,
        amount: Number(row.current_month) || 0
      })) || [];

      return {
        totalRevenue,
        revenueByMonth
      };
    },
    enabled: !!currentCompany?.id
  });
};
