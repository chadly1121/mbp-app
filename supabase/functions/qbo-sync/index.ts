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
    const itemsResponse = await fetch(`${baseUrl}/item`, { headers })
    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch items: ${itemsResponse.statusText}`)
    }

    const itemsData = await itemsResponse.json()
    const items: QBOItem[] = itemsData.QueryResponse?.Item || []

    for (const item of items) {
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
      }
    }

    // Sync Chart of Accounts
    console.log('Syncing accounts from QBO')
    const accountsResponse = await fetch(`${baseUrl}/account`, { headers })
    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch accounts: ${accountsResponse.statusText}`)
    }

    const accountsData = await accountsResponse.json()
    const accounts: QBOAccount[] = accountsData.QueryResponse?.Account || []

    for (const account of accounts) {
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
      }
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
      accountsCount: accounts.length 
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