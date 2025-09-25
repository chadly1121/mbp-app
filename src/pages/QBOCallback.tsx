import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const QBOCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const realmId = searchParams.get('realmId');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state || !realmId) {
          throw new Error('Missing required OAuth parameters');
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Call the edge function to handle the callback using Supabase client
        const { data: result, error: invokeError } = await supabase.functions.invoke('qbo-auth', {
          body: {
            action: 'callback',
            code,
            state,
            realmId
          }
        });

        if (invokeError) {
          throw new Error(invokeError.message || 'Failed to complete OAuth flow');
        }
        
        if (result.success) {
          setStatus('success');
          toast({
            title: "Success!",
            description: "QuickBooks Online connected successfully.",
          });
          
          // Check if we're in a popup window
          if (window.opener && window.opener !== window) {
            // We're in a popup, close it after a short delay
            setTimeout(() => {
              window.close();
            }, 1500);
          } else {
            // Regular window, redirect back to the main app
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          }
        } else {
          throw new Error('OAuth flow did not complete successfully');
        }

      } catch (error) {
        console.error('QBO Callback error:', error);
        setStatus('error');
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : "Failed to connect to QuickBooks Online",
          variant: "destructive",
        });
        
        // Check if we're in a popup window
        if (window.opener && window.opener !== window) {
          // We're in a popup, close it after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // Regular window, redirect back to the main app
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-lg border border-border shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Connecting to QuickBooks Online</h2>
            <p className="text-muted-foreground">Please wait while we complete the connection...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-800">Connection Successful!</h2>
            <p className="text-muted-foreground">QuickBooks Online has been connected successfully. Redirecting you back to the app...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">Connection Failed</h2>
            <p className="text-muted-foreground">There was an issue connecting to QuickBooks Online. Redirecting you back to try again...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default QBOCallback;