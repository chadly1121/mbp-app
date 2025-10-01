import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KPI {
  id: string;
  company_id: string;
  name: string;
  qbo_metric_type: string;
  qbo_account_filter: string | null;
  frequency: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { company_id } = await req.json();

    if (!company_id) {
      throw new Error('company_id is required');
    }

    console.log('Syncing KPIs for company:', company_id);

    // Get all auto-sync enabled KPIs for this company
    const { data: kpis, error: kpisError } = await supabase
      .from('kpis')
      .select('*')
      .eq('company_id', company_id)
      .eq('auto_sync', true)
      .eq('data_source', 'qbo')
      .eq('is_active', true);

    if (kpisError) {
      console.error('Error fetching KPIs:', kpisError);
      throw kpisError;
    }

    if (!kpis || kpis.length === 0) {
      console.log('No auto-sync KPIs found for this company');
      return new Response(
        JSON.stringify({ message: 'No auto-sync KPIs found', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${kpis.length} KPIs to sync`);

    // Get current fiscal year for QBO data
    const currentYear = new Date().getFullYear();

    // Get current date info for filtering
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentQuarter = Math.ceil(currentMonth / 3);

    // Process each KPI
    const updates = await Promise.all(
      kpis.map(async (kpi: KPI) => {
        try {
          const value = await calculateKPIValue(
            supabase, 
            kpi, 
            company_id, 
            currentYear,
            currentMonth,
            currentQuarter
          );
          
          if (value !== null) {
            const { error: updateError } = await supabase
              .from('kpis')
              .update({
                current_value: value,
                last_synced_at: new Date().toISOString()
              })
              .eq('id', kpi.id);

            if (updateError) {
              console.error(`Error updating KPI ${kpi.id}:`, updateError);
              return { kpi_id: kpi.id, success: false, error: updateError.message };
            }

            console.log(`Updated KPI ${kpi.name} (${kpi.frequency}) with value ${value}`);
            return { kpi_id: kpi.id, success: true, value };
          }

          return { kpi_id: kpi.id, success: false, error: 'Could not calculate value' };
        } catch (error) {
          console.error(`Error processing KPI ${kpi.id}:`, error);
          return { kpi_id: kpi.id, success: false, error: error.message };
        }
      })
    );

    const successCount = updates.filter(u => u.success).length;
    console.log(`Successfully updated ${successCount} out of ${kpis.length} KPIs`);

    return new Response(
      JSON.stringify({
        message: 'KPI sync completed',
        total: kpis.length,
        updated: successCount,
        results: updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error syncing KPIs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function calculateKPIValue(
  supabase: any,
  kpi: KPI,
  company_id: string,
  fiscal_year: number,
  current_month: number,
  current_quarter: number
): Promise<number | null> {
  const { qbo_metric_type, frequency } = kpi;

  // Determine date range based on frequency
  const { startMonth, endMonth } = getDateRangeForFrequency(frequency, current_month, current_quarter);

  console.log(`Calculating ${qbo_metric_type} for ${frequency} period (months ${startMonth}-${endMonth})`);

  switch (qbo_metric_type) {
    case 'total_revenue':
      return await getTotalRevenue(supabase, company_id, fiscal_year, startMonth, endMonth);
    
    case 'total_expenses':
      return await getTotalExpenses(supabase, company_id, fiscal_year, startMonth, endMonth);
    
    case 'net_income':
      return await getNetIncome(supabase, company_id, fiscal_year, startMonth, endMonth);
    
    case 'accounts_receivable':
      return await getAccountsReceivable(supabase, company_id);
    
    case 'accounts_payable':
      return await getAccountsPayable(supabase, company_id);
    
    case 'invoice_count':
      return await getInvoiceCount(supabase, company_id, startMonth, endMonth);
    
    case 'estimate_count':
      return await getEstimateCount(supabase, company_id);
    
    case 'sales_count':
      return await getSalesCount(supabase, company_id, startMonth, endMonth);
    
    default:
      console.log(`Unknown metric type: ${qbo_metric_type}`);
      return null;
  }
}

function getDateRangeForFrequency(
  frequency: string,
  current_month: number,
  current_quarter: number
): { startMonth: number; endMonth: number } {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      // For daily, use current month (best we can do with monthly QBO data)
      return { startMonth: current_month, endMonth: current_month };
    
    case 'weekly':
      // For weekly, use current month as approximation
      return { startMonth: current_month, endMonth: current_month };
    
    case 'monthly':
      // Current month only
      return { startMonth: current_month, endMonth: current_month };
    
    case 'quarterly':
      // Current quarter (e.g., Q1 = months 1-3, Q2 = 4-6, etc.)
      const quarterStart = (current_quarter - 1) * 3 + 1;
      const quarterEnd = current_quarter * 3;
      return { startMonth: quarterStart, endMonth: quarterEnd };
    
    case 'yearly':
      // Year to date
      return { startMonth: 1, endMonth: current_month };
    
    default:
      // Default to current month
      return { startMonth: current_month, endMonth: current_month };
  }
}

async function getTotalRevenue(
  supabase: any, 
  company_id: string, 
  fiscal_year: number,
  start_month: number,
  end_month: number
): Promise<number> {
  const { data, error } = await supabase
    .from('qbo_profit_loss')
    .select('current_month, fiscal_month')
    .eq('company_id', company_id)
    .eq('fiscal_year', fiscal_year)
    .eq('account_type', 'revenue')
    .gte('fiscal_month', start_month)
    .lte('fiscal_month', end_month);

  if (error) throw error;
  
  return data?.reduce((sum: number, row: any) => sum + (parseFloat(row.current_month) || 0), 0) || 0;
}

async function getTotalExpenses(
  supabase: any, 
  company_id: string, 
  fiscal_year: number,
  start_month: number,
  end_month: number
): Promise<number> {
  const { data, error } = await supabase
    .from('qbo_profit_loss')
    .select('current_month, fiscal_month')
    .eq('company_id', company_id)
    .eq('fiscal_year', fiscal_year)
    .eq('account_type', 'expense')
    .gte('fiscal_month', start_month)
    .lte('fiscal_month', end_month);

  if (error) throw error;
  
  return data?.reduce((sum: number, row: any) => sum + (parseFloat(row.current_month) || 0), 0) || 0;
}

async function getNetIncome(
  supabase: any, 
  company_id: string, 
  fiscal_year: number,
  start_month: number,
  end_month: number
): Promise<number> {
  const revenue = await getTotalRevenue(supabase, company_id, fiscal_year, start_month, end_month);
  const expenses = await getTotalExpenses(supabase, company_id, fiscal_year, start_month, end_month);
  return revenue - expenses;
}

async function getAccountsReceivable(supabase: any, company_id: string): Promise<number> {
  const { data, error } = await supabase
    .from('ar_tracker')
    .select('balance_due')
    .eq('company_id', company_id)
    .eq('status', 'pending');

  if (error) throw error;
  
  return data?.reduce((sum: number, row: any) => sum + (parseFloat(row.balance_due) || 0), 0) || 0;
}

async function getAccountsPayable(supabase: any, company_id: string): Promise<number> {
  // Assuming you have an AP tracker table similar to AR tracker
  const { data, error } = await supabase
    .from('qbo_profit_loss')
    .select('current_month')
    .eq('company_id', company_id)
    .eq('account_name', 'Accounts Payable')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  return parseFloat(data?.current_month || '0');
}

async function getInvoiceCount(
  supabase: any, 
  company_id: string,
  start_month: number,
  end_month: number
): Promise<number> {
  // Get invoices within the date range
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, start_month - 1, 1).toISOString();
  const endDate = new Date(currentYear, end_month, 0, 23, 59, 59).toISOString();
  
  const { count, error } = await supabase
    .from('ar_tracker')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id)
    .gte('invoice_date', startDate)
    .lte('invoice_date', endDate);

  if (error) throw error;
  
  return count || 0;
}

async function getEstimateCount(supabase: any, company_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('sales_pipeline')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id)
    .eq('stage', 'quote_sent');

  if (error) throw error;
  
  return count || 0;
}

async function getSalesCount(
  supabase: any, 
  company_id: string,
  start_month: number,
  end_month: number
): Promise<number> {
  // Get paid invoices within the date range
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, start_month - 1, 1).toISOString();
  const endDate = new Date(currentYear, end_month, 0, 23, 59, 59).toISOString();
  
  const { count, error } = await supabase
    .from('ar_tracker')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id)
    .eq('status', 'paid')
    .gte('invoice_date', startDate)
    .lte('invoice_date', endDate);

  if (error) throw error;
  
  return count || 0;
}