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

      // Sync QBO data
      const response = await supabase.functions.invoke('qbo-sync', {
        body: { companyId: currentCompany.id },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      const result = response.data;
      
      // Sync KPIs after QBO sync completes
      let kpiUpdateCount = 0;
      try {
        const kpiResponse = await supabase.functions.invoke('sync-kpis', {
          body: { company_id: currentCompany.id },
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (kpiResponse.error) {
          console.error('KPI sync error:', kpiResponse.error);
          toast({
            title: 'Warning',
            description: 'QBO data synced but KPI update failed. Check KPI configuration.',
            variant: 'destructive',
          });
        } else if (kpiResponse.data) {
          console.log('KPI sync result:', kpiResponse.data);
          kpiUpdateCount = kpiResponse.data.updated || 0;
        }
      } catch (kpiError) {
        console.error('KPI sync error:', kpiError);
        // Don't fail the whole sync if KPI sync fails
      }
      
      toast({
        title: 'Sync Completed',
        description: `Synced ${result.itemsCount || 0} items, ${result.accountsCount || 0} accounts${kpiUpdateCount > 0 ? `, and ${kpiUpdateCount} KPIs` : ''} from QuickBooks Online`,
      });

      // Reload page to show updated data
      if (onSyncComplete) {
        onSyncComplete();
      } else {
        // Force page reload if no callback provided
        window.location.reload();
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
