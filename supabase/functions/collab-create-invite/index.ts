import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

function generateRandomToken(length = 40): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    // Get authorization header and create authenticated client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized - missing auth header', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Parse request body
    const { objectiveId, email, role } = await req.json();
    
    // Validate input
    if (!objectiveId || !email || !['editor', 'viewer'].includes(role)) {
      return new Response('Bad request - missing or invalid parameters', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Generate unique token
    const token = generateRandomToken();

    // Insert invite record
    const { error: insertError } = await supabase
      .from('objective_invites')
      .insert({
        objective_id: objectiveId,
        email: email,
        role: role,
        token: token
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(`Database error: ${insertError.message}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

  // Generate invite link
  const appUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}` || 'http://localhost:5173';
  const link = `${appUrl}/invite/${token}`;

    console.log(`Invite created for ${email} with role ${role}, token: ${token}`);

    return new Response(
      JSON.stringify({ link, token }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('Error in collab-create-invite function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

serve(handler);