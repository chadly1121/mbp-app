import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication with service role client first
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Create user-context client for RLS-protected operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'connect') {
      // Initiate OAuth flow
      const companyId = url.searchParams.get('companyId')
      if (!companyId) {
        throw new Error('Company ID is required')
      }

      const clientId = Deno.env.get('QBO_CLIENT_ID')
      const redirectUri = 'https://mbp-app.lovable.app/qbo-callback'
      
      const scope = 'com.intuit.quickbooks.accounting'
      const state = `${user.id}:${companyId}`
      
      const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${encodeURIComponent(state)}`

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const realmId = url.searchParams.get('realmId')

      if (!code || !state || !realmId) {
        throw new Error('Missing required OAuth parameters')
      }

      const [userId, companyId] = state.split(':')
      if (userId !== user.id) {
        throw new Error('Invalid state parameter')
      }

      // Exchange code for access token
      const clientId = Deno.env.get('QBO_CLIENT_ID')
      const clientSecret = Deno.env.get('QBO_CLIENT_SECRET')
      const redirectUri = 'https://mbp-app.lovable.app/qbo-callback'

      const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri
        })
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        console.error('Token exchange failed:', error)
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()
      console.log('Token exchange successful')

      // Store QBO credentials securely using security definer function
      const { data: connectionId, error: storeError } = await supabase
        .rpc('store_qbo_connection', {
          p_company_id: companyId,
          p_qbo_company_id: realmId,
          p_access_token: tokenData.access_token,
          p_refresh_token: tokenData.refresh_token,
          p_token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        })

      if (storeError) {
        console.error('Database store error details:', storeError)
        throw new Error(`Failed to save connection: ${storeError.message || storeError.details || storeError}`)
      }

      console.log('QBO connection saved successfully')
      return new Response(JSON.stringify({ success: true, realmId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('QBO Auth Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})