import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CollaborationInviteRequest {
  email: string;
  role: string;
  objectiveTitle: string;
  objectiveDescription?: string;
  inviterName: string;
  inviterEmail: string;
  companyName: string;
  collaboratorId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing collaboration invite request");
    
    const { 
      email, 
      role, 
      objectiveTitle, 
      objectiveDescription,
      inviterName, 
      inviterEmail,
      companyName,
      collaboratorId 
    }: CollaborationInviteRequest = await req.json();

    console.log(`Sending invite to ${email} for objective: ${objectiveTitle}`);

    // Create Supabase client for authentication check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }

    // Generate role description
    const getRoleDescription = (role: string) => {
      switch (role) {
        case 'accountability_partner':
          return 'Accountability Partner - Help keep the objective on track and provide support';
        case 'collaborator':
          return 'Collaborator - Work together on completing this objective';
        case 'viewer':
          return 'Viewer - Stay informed about progress and updates';
        default:
          return 'Team Member';
      }
    };

    const roleDescription = getRoleDescription(role);
    const acceptUrl = `${supabaseUrl.replace('.supabase.co', '')}.lovableproject.com/?invite=${collaboratorId}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎯 Strategic Objective Collaboration Invite</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e1e5e9;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on a strategic objective at <strong>${companyName}</strong>.
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #667eea;">📋 Objective Details</h3>
              <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${objectiveTitle}</p>
              ${objectiveDescription ? `<p style="margin: 0 0 8px 0;"><strong>Description:</strong> ${objectiveDescription}</p>` : ''}
              <p style="margin: 0;"><strong>Your Role:</strong> ${roleDescription}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background 0.3s;">
                🚀 Accept Invitation & View Objective
              </a>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 4px; padding: 15px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1976d2;">✨ What you can do:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #1976d2;">
                ${role === 'accountability_partner' ? `
                  <li>Help keep the team accountable and on track</li>
                  <li>Provide support and encouragement</li>
                  <li>Monitor progress and milestones</li>
                ` : role === 'collaborator' ? `
                  <li>Add and complete checklist items</li>
                  <li>Comment and provide updates</li>
                  <li>Work together on achieving the objective</li>
                ` : `
                  <li>View objective progress and updates</li>
                  <li>Stay informed about milestones</li>
                  <li>Read team discussions and comments</li>
                `}
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
              If you didn't expect this invitation or have questions, you can contact ${inviterEmail} directly.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email using Resend API directly
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${companyName} Strategic Planning <onboarding@resend.dev>`,
        to: [email],
        subject: `🎯 Invitation to collaborate on "${objectiveTitle}"`,
        html: emailHtml,
      }),
    });

    const emailResult = await resendResponse.json();
    
    if (!resendResponse.ok) {
      console.error('Resend API error:', emailResult);
      throw new Error(`Email sending failed: ${emailResult.message || 'Unknown error'}`);
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResult.id,
      message: "Collaboration invite sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-collaboration-invite function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);