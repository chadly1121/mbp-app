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

      const { data, error } = await supabase
        .from('income_statements')
        .select('month_number, current_month, year_to_date')
        .eq('company_id', currentCompany.id)
        .eq('year', year)
        .eq('category', 'Revenue')
        .order('month_number', { ascending: true });

      if (error) throw error;

      // Calculate total revenue (sum of all monthly revenue)
      const totalRevenue = data?.reduce((sum, row) => {
        return sum + (Number(row.current_month) || 0);
      }, 0) || 0;

      // Group by month
      const revenueByMonth = data?.map(row => ({
        month: row.month_number,
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
