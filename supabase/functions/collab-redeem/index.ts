import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Use service role client for bypassing RLS
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pathname, searchParams } = new URL(req.url);
    
    if (req.method === 'GET' && pathname === '/comment') {
      // Handle guest comment submission via query parameters
      const token = searchParams.get('token') ?? '';
      const body = searchParams.get('body') ?? '';
      const objectiveId = searchParams.get('objectiveId') ?? '';

      if (!token || !objectiveId || !body) {
        return new Response('Bad request - missing parameters', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      // Verify the invite token
      const { data: invite, error: inviteError } = await supabaseService
        .from('objective_invites')
        .select('id, objective_id, role, expires_at, used_at, email')
        .eq('token', token)
        .maybeSingle();

      if (inviteError) {
        console.error('Error fetching invite:', inviteError);
        return new Response('Database error', { 
          status: 500,
          headers: corsHeaders 
        });
      }

      if (!invite) {
        return new Response('Invalid token', { 
          status: 401,
          headers: corsHeaders 
        });
      }

      // Check if token is expired
      if (new Date(invite.expires_at) < new Date()) {
        return new Response('Expired token', { 
          status: 401,
          headers: corsHeaders 
        });
      }

      // Check if token matches the objective
      if (invite.objective_id !== objectiveId) {
        return new Response('Token mismatch', { 
          status: 401,
          headers: corsHeaders 
        });
      }

      // Insert the guest comment
      const { error: commentError } = await supabaseService
        .from('objective_comments')
        .insert({
          objective_id: objectiveId,
          author_email: `${invite.email} (guest)`,
          body: body
        });

      if (commentError) {
        console.error('Error inserting comment:', commentError);
        return new Response(`Comment error: ${commentError.message}`, { 
          status: 400,
          headers: corsHeaders 
        });
      }

      console.log(`Guest comment added for objective ${objectiveId} by ${invite.email}`);

      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response('Not found', { 
      status: 404,
      headers: corsHeaders 
    });

  } catch (error: any) {
    console.error('Error in collab-redeem function:', error);
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