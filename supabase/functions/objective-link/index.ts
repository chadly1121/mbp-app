import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const action = parts.pop(); // "link" or "revoke"
    const objectiveId = parts[parts.length - 1];
    const role = url.searchParams.get("role") ?? "viewer";

    if (action === "revoke") {
      const token = url.searchParams.get("token");
      if (!token) {
        return new Response("Missing token", { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      const { error } = await supabase
        .from("objective_links")
        .update({ revoked: true })
        .eq("token", token);

      if (error) {
        return new Response(error.message, { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    }

    // Normal link generation
    let { data: existing } = await supabase
      .from("objective_links")
      .select("*")
      .eq("objective_id", objectiveId)
      .eq("role", role)
      .eq("revoked", false)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase
        .from("objective_links")
        .insert({
          objective_id: objectiveId,
          role,
          expires_at: null, // set manually if needed
        })
        .select()
        .single();

      if (error) {
        return new Response(error.message, { 
          status: 400, 
          headers: corsHeaders 
        });
      }
      existing = data;
    }

    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:5173';
    const linkUrl = `${appUrl}/share/${existing.token}`;
    
    return new Response(JSON.stringify({ url: linkUrl, link: existing }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });

  } catch (error: any) {
    console.error('Error in objective-link function:', error);
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