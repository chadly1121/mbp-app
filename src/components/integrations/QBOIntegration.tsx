import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface QBOConnection {
  id: string;
  qbo_company_id: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export const QBOIntegration = () => {
  const [connection, setConnection] = useState<QBOConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { currentCompany } = useCompany();
  const { toast } = useToast();

  useEffect(() => {
    if (currentCompany) {
      checkConnection();
    }
  }, [currentCompany]);

  const checkConnection = async () => {
    if (!currentCompany) return;

    try {
      // Check if there's a QBO connection for this company
      // Since types aren't updated yet, we'll handle this gracefully
      const { data, error } = await (supabase as any)
        .from('qbo_connections')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking QBO connection:', error);
        setConnection(null);
      } else {
        setConnection(data as QBOConnection | null);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!currentCompany) return;

    setConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call the edge function with the correct parameters
      const response = await fetch(`https://qdrcpflmnxhkzrlhdhda.supabase.co/functions/v1/qbo-auth?action=connect&companyId=${currentCompany.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate OAuth flow');
      }

      const { authUrl } = await response.json();
      
      // Open QuickBooks OAuth in new window
      const popup = window.open(authUrl, 'qbo-oauth', 'width=600,height=600');
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          checkConnection(); // Refresh connection status
          setConnecting(false);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Connect error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to QuickBooks Online',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!currentCompany || !connection) return;

    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('qbo-sync', {
        body: { companyId: currentCompany.id },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      const result = response.data;
      
      toast({
        title: 'Sync Completed',
        description: `Synced ${result.itemsCount} items and ${result.accountsCount} accounts from QuickBooks Online`,
      });

      checkConnection(); // Refresh to get updated last_sync_at

    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync with QuickBooks Online',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    try {
      // Use type assertion for now since types aren't updated yet
      const { error } = await (supabase as any)
        .from('qbo_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection(null);
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from QuickBooks Online',
      });
    } catch (error: any) {
      toast({
        title: 'Disconnect Failed',
        description: error.message || 'Failed to disconnect',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              QuickBooks Online
              {connection ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Sync your products and chart of accounts with QuickBooks Online
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">QuickBooks Company ID:</span>
                <p className="text-muted-foreground">{connection.qbo_company_id}</p>
              </div>
              <div>
                <span className="font-medium">Connected Since:</span>
                <p className="text-muted-foreground">
                  {new Date(connection.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium">Last Sync:</span>
                <p className="text-muted-foreground">
                  {connection.last_sync_at 
                    ? new Date(connection.last_sync_at).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSync} 
                disabled={syncing}
                className="flex items-center gap-2"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your QuickBooks Online account to automatically sync:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Products and services</li>
              <li>Chart of accounts</li>
              <li>Keep your data in sync automatically</li>
            </ul>
            
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="flex items-center gap-2"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {connecting ? 'Connecting...' : 'Connect to QuickBooks Online'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};