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

    // Process each KPI
    const updates = await Promise.all(
      kpis.map(async (kpi: KPI) => {
        try {
          const value = await calculateKPIValue(supabase, kpi, company_id, currentYear);
          
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

            console.log(`Updated KPI ${kpi.name} with value ${value}`);
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
  fiscal_year: number
): Promise<number | null> {
  const { qbo_metric_type } = kpi;

  switch (qbo_metric_type) {
    case 'total_revenue':
      return await getTotalRevenue(supabase, company_id, fiscal_year);
    
    case 'total_expenses':
      return await getTotalExpenses(supabase, company_id, fiscal_year);
    
    case 'net_income':
      return await getNetIncome(supabase, company_id, fiscal_year);
    
    case 'accounts_receivable':
      return await getAccountsReceivable(supabase, company_id);
    
    case 'accounts_payable':
      return await getAccountsPayable(supabase, company_id);
    
    case 'invoice_count':
      return await getInvoiceCount(supabase, company_id);
    
    case 'estimate_count':
      return await getEstimateCount(supabase, company_id);
    
    case 'sales_count':
      return await getSalesCount(supabase, company_id);
    
    default:
      console.log(`Unknown metric type: ${qbo_metric_type}`);
      return null;
  }
}

async function getTotalRevenue(supabase: any, company_id: string, fiscal_year: number): Promise<number> {
  const { data, error } = await supabase
    .from('qbo_profit_loss')
    .select('current_month')
    .eq('company_id', company_id)
    .eq('fiscal_year', fiscal_year)
    .eq('account_type', 'revenue');

  if (error) throw error;
  
  return data?.reduce((sum: number, row: any) => sum + (parseFloat(row.current_month) || 0), 0) || 0;
}

async function getTotalExpenses(supabase: any, company_id: string, fiscal_year: number): Promise<number> {
  const { data, error } = await supabase
    .from('qbo_profit_loss')
    .select('current_month')
    .eq('company_id', company_id)
    .eq('fiscal_year', fiscal_year)
    .eq('account_type', 'expense');

  if (error) throw error;
  
  return data?.reduce((sum: number, row: any) => sum + (parseFloat(row.current_month) || 0), 0) || 0;
}

async function getNetIncome(supabase: any, company_id: string, fiscal_year: number): Promise<number> {
  const revenue = await getTotalRevenue(supabase, company_id, fiscal_year);
  const expenses = await getTotalExpenses(supabase, company_id, fiscal_year);
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

async function getInvoiceCount(supabase: any, company_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('ar_tracker')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id);

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

async function getSalesCount(supabase: any, company_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('ar_tracker')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id)
    .eq('status', 'paid');

  if (error) throw error;
  
  return count || 0;
}