import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "@/hooks/use-toast";

interface QBOSyncButtonProps {
  onSyncComplete?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const QBOSyncButton = ({ 
  onSyncComplete, 
  variant = "outline", 
  size = "sm",
  className = "" 
}: QBOSyncButtonProps) => {
  const { currentCompany } = useCompany();
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [currentCompany?.id]);

  const checkConnection = async () => {
    if (!currentCompany?.id) return;
    
    try {
      const { data } = await supabase.rpc('get_qbo_connection_status', {
        p_company_id: currentCompany.id
      });
      
      setIsConnected(data && data.length > 0 && data[0]?.is_active);
    } catch (error) {
      console.error('Error checking QBO connection:', error);
      setIsConnected(false);
    }
  };

  const handleSync = async () => {
    if (!currentCompany || !isConnected) return;

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
        description: `Synced ${result.itemsCount || 0} items and ${result.accountsCount || 0} accounts from QuickBooks Online`,
      });

      if (onSyncComplete) {
        onSyncComplete();
      }

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

  if (!isConnected) {
    return null;
  }

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      variant={variant}
      size={size}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync with QB'}
    </Button>
  );
};
