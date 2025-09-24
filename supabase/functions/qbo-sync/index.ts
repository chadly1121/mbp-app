import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QBOItem {
  Id: string
  Name: string
  Description?: string
  UnitPrice?: number
  Type: string
  Active: boolean
}

interface QBOAccount {
  Id: string
  Name: string
  AccountType: string
  AccountSubType: string
  Active: boolean
}

interface QBOProfitLossRow {
  group?: string
  ColData: Array<{
    value?: string
    id?: string
  }>
}

interface QBOProfitLossReport {
  Header?: {
    ReportName: string
    StartPeriod: string
    EndPeriod: string
  }
  Rows?: QBOProfitLossRow[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { companyId } = await req.json()
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    // Get QBO connection details
    const { data: connection, error: connectionError } = await supabase
      .from('qbo_connections')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      throw new Error('No active QBO connection found')
    }

    console.log('Starting QBO sync for company:', companyId)

    // Check if token needs refresh
    let accessToken = connection.access_token
    if (new Date(connection.token_expires_at) <= new Date()) {
      console.log('Refreshing expired token')
      accessToken = await refreshToken(supabase, connection)
    }

    const baseUrl = `https://sandbox-quickbooks.api.intuit.com/v3/company/${connection.qbo_company_id}`
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }

    // Sync Items (Products/Services)
    console.log('Syncing items from QBO')
    const itemsResponse = await fetch(`${baseUrl}/query?query=SELECT * FROM Item`, { headers })
    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch items: ${itemsResponse.statusText}`)
    }

    const itemsData = await itemsResponse.json()
    const items: QBOItem[] = itemsData.QueryResponse?.Item || []
    
    console.log('QBO Items Response:', JSON.stringify(itemsData, null, 2))
    console.log(`Found ${items.length} items from QBO`)

    for (const item of items) {
      console.log(`Syncing item: ${item.Name} (ID: ${item.Id})`)
      const { error } = await supabase
        .from('products')
        .upsert({
          company_id: companyId,
          name: item.Name,
          description: item.Description || null,
          product_type: item.Type || 'service',
          unit_price: item.UnitPrice || null,
          is_active: item.Active,
          qbo_id: item.Id
        }, { 
          onConflict: 'company_id,qbo_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error(`Error syncing item ${item.Name}:`, error)
      } else {
        console.log(`Successfully synced item: ${item.Name}`)
      }
    }

    // Sync Chart of Accounts
    console.log('Syncing accounts from QBO')
    const accountsResponse = await fetch(`${baseUrl}/query?query=SELECT * FROM Account`, { headers })
    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch accounts: ${accountsResponse.statusText}`)
    }

    const accountsData = await accountsResponse.json()
    const accounts: QBOAccount[] = accountsData.QueryResponse?.Account || []
    
    console.log('QBO Accounts Response:', JSON.stringify(accountsData, null, 2))
    console.log(`Found ${accounts.length} accounts from QBO`)

    for (const account of accounts) {
      console.log(`Syncing account: ${account.Name} (ID: ${account.Id})`)
      const { error } = await supabase
        .from('chart_of_accounts')
        .upsert({
          company_id: companyId,
          account_code: account.Id,
          account_name: account.Name,
          account_type: mapQBOAccountType(account.AccountType),
          is_active: account.Active,
          qbo_id: account.Id
        }, { 
          onConflict: 'company_id,qbo_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error(`Error syncing account ${account.Name}:`, error)
      } else {
        console.log(`Successfully synced account: ${account.Name}`)
      }
    }

    // Sync P&L Report Data
    console.log('Syncing P&L report data from QBO')
    let plDataCount = 0
    
    try {
      // Get current date for report
      const currentDate = new Date()
      const fiscalYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1 // 1-12
      const currentQuarter = Math.ceil(currentMonth / 3)
      
      // Get YTD P&L report
      const startDate = `${fiscalYear}-01-01`
      const endDate = currentDate.toISOString().split('T')[0]
      
      const plUrl = `${baseUrl}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`
      console.log('Fetching P&L report from:', plUrl)
      
      const plResponse = await fetch(plUrl, { headers })
      if (plResponse.ok) {
        const plData = await plResponse.json()
        const report: QBOProfitLossReport = plData.QueryResponse?.Report || {}
        
        console.log('P&L Report Response:', JSON.stringify(plData, null, 2))
        
        if (report.Rows) {
          // Process P&L data
          plDataCount = await processProfitLossData(supabase, companyId, report, fiscalYear, currentMonth, currentQuarter, currentDate)
        }
      } else {
        console.warn('Failed to fetch P&L report:', plResponse.statusText)
      }
    } catch (error) {
      console.error('Error syncing P&L data:', error)
    }

    // Update last sync time
    await supabase
      .from('qbo_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id)

    console.log('QBO sync completed successfully')

    return new Response(JSON.stringify({ 
      success: true, 
      itemsCount: items.length,
      accountsCount: accounts.length,
      plDataCount: plDataCount,
      message: `Synced ${items.length} items, ${accounts.length} accounts, and ${plDataCount} P&L entries from QuickBooks Online`,
      itemsFound: items.map(i => ({ name: i.Name, id: i.Id, type: i.Type })),
      accountsFound: accounts.map(a => ({ name: a.Name, id: a.Id, type: a.AccountType }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('QBO Sync Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function refreshToken(supabase: any, connection: any): Promise<string> {
  const clientId = Deno.env.get('QBO_CLIENT_ID')
  const clientSecret = Deno.env.get('QBO_CLIENT_SECRET')

  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()

  // Update stored tokens
  await supabase
    .from('qbo_connections')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token || connection.refresh_token,
      token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
    })
    .eq('id', connection.id)

  return data.access_token
}

async function processProfitLossData(
  supabase: any, 
  companyId: string, 
  report: QBOProfitLossReport, 
  fiscalYear: number,
  currentMonth: number,
  currentQuarter: number,
  reportDate: Date
): Promise<number> {
  let processedCount = 0
  
  if (!report.Rows) return processedCount

  // First, clear existing P&L data for this fiscal year
  await supabase
    .from('qbo_profit_loss')
    .delete()
    .eq('company_id', companyId)
    .eq('fiscal_year', fiscalYear)

  for (const row of report.Rows) {
    if (!row.ColData || row.ColData.length === 0) continue
    
    // Skip header and total rows
    if (row.group || !row.ColData[0]?.value) continue
    
    const accountName = row.ColData[0]?.value
    if (!accountName || accountName.includes('Total') || accountName.includes('NET')) continue
    
    // Determine account type from the account name or position in report
    let accountType = 'expense'
    if (accountName.toLowerCase().includes('income') || 
        accountName.toLowerCase().includes('sales') || 
        accountName.toLowerCase().includes('revenue')) {
      accountType = 'revenue'
    } else if (accountName.toLowerCase().includes('cost')) {
      accountType = 'cost_of_goods_sold'
    }
    
    // Find matching account in chart_of_accounts
    const { data: chartAccount } = await supabase
      .from('chart_of_accounts')
      .select('id, qbo_id')
      .eq('company_id', companyId)
      .eq('account_name', accountName)
      .single()
    
    // Process monthly data from ColData (typically columns 1-12 are months, 13 is YTD total)
    let yearToDateAmount = 0
    let currentMonthAmount = 0
    let quarterToDateAmount = 0
    
    // Extract YTD amount (usually the last column)
    if (row.ColData.length > 1) {
      const ytdValue = row.ColData[row.ColData.length - 1]?.value
      if (ytdValue && !isNaN(parseFloat(ytdValue))) {
        yearToDateAmount = parseFloat(ytdValue)
      }
    }
    
    // Extract current month amount (varies by report structure)
    if (currentMonth <= row.ColData.length - 1) {
      const monthValue = row.ColData[currentMonth]?.value
      if (monthValue && !isNaN(parseFloat(monthValue))) {
        currentMonthAmount = parseFloat(monthValue)
      }
    }
    
    // Calculate quarter-to-date (sum of months in current quarter)
    const quarterStartMonth = (currentQuarter - 1) * 3 + 1
    for (let m = quarterStartMonth; m <= currentMonth && m < row.ColData.length; m++) {
      const monthValue = row.ColData[m]?.value
      if (monthValue && !isNaN(parseFloat(monthValue))) {
        quarterToDateAmount += parseFloat(monthValue)
      }
    }
    
    // Insert P&L data
    const plEntry = {
      company_id: companyId,
      account_id: chartAccount?.id || null,
      account_name: accountName,
      account_type: accountType,
      qbo_account_id: chartAccount?.qbo_id || null,
      report_date: reportDate.toISOString().split('T')[0],
      fiscal_year: fiscalYear,
      fiscal_quarter: currentQuarter,
      fiscal_month: currentMonth,
      current_month: currentMonthAmount,
      quarter_to_date: quarterToDateAmount,
      year_to_date: yearToDateAmount,
      budget_current_month: 0,
      budget_quarter_to_date: 0,
      budget_year_to_date: 0,
      variance_current_month: currentMonthAmount,
      variance_quarter_to_date: quarterToDateAmount,
      variance_year_to_date: yearToDateAmount
    }
    
    const { error } = await supabase
      .from('qbo_profit_loss')
      .insert(plEntry)
    
    if (error) {
      console.error(`Error inserting P&L data for ${accountName}:`, error)
    } else {
      console.log(`Successfully synced P&L data for: ${accountName}`)
      processedCount++
    }
  }
  
  return processedCount
}

function mapQBOAccountType(qboType: string): string {
  const mapping: Record<string, string> = {
    'Asset': 'asset',
    'Liability': 'liability',
    'Equity': 'equity',
    'Income': 'revenue',
    'Revenue': 'revenue',
    'Expense': 'expense',
    'Cost of Goods Sold': 'expense'
  }
  return mapping[qboType] || 'asset'
}