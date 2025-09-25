import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, RefreshCw, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ARRecord {
  id: string;
  invoice_number: string;
  client_name: string;
  invoice_date: string;
  due_date: string;
  invoice_amount: number;
  paid_amount?: number;
  balance_due: number;
  days_outstanding?: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_terms?: string;
  notes?: string;
}

export const ARTracker = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [arRecords, setARRecords] = useState<ARRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      fetchARRecords();
    }
  }, [currentCompany]);

  const fetchARRecords = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('ar_tracker')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setARRecords((data as ARRecord[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading AR records",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncFromQBO = async () => {
    if (!currentCompany) return;

    setSyncing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('https://qdrcpflmnxhkzrlhdhda.supabase.co/functions/v1/qbo-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ companyId: currentCompany.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Sync completed",
        description: `Successfully synced ${result.invoicesCount || 0} invoices from QuickBooks Online.`,
      });

      // Refresh the AR records
      fetchARRecords();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync with QuickBooks Online. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTotalOutstanding = () => {
    return arRecords.reduce((total, record) => total + record.balance_due, 0);
  };

  const getOverdueAmount = () => {
    return arRecords
      .filter(record => record.status === 'overdue')
      .reduce((total, record) => total + record.balance_due, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Accounts Receivable Tracker
            </h2>
            <p className="text-muted-foreground">
              Track outstanding invoices synced from QuickBooks Online
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Accounts Receivable Tracker
          </h2>
          <p className="text-muted-foreground">
            Track outstanding invoices synced from QuickBooks Online
          </p>
        </div>
        <Button onClick={syncFromQBO} disabled={syncing}>
          {syncing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {syncing ? 'Syncing...' : 'Sync from QuickBooks'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalOutstanding().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${getOverdueAmount().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      {arRecords.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Invoices Found</h4>
          <p className="text-muted-foreground mb-4">
            No outstanding invoices found. Click "Sync from QuickBooks" to import your invoices.
          </p>
          <Button onClick={syncFromQBO} disabled={syncing}>
            {syncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncing ? 'Syncing...' : 'Sync from QuickBooks'}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {arRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {record.invoice_number}
                      {record.status === 'overdue' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </CardTitle>
                    <CardDescription>{record.client_name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Invoice Amount</div>
                    <div className="font-medium">${record.invoice_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Balance Due</div>
                    <div className="font-medium">${record.balance_due.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div className="font-medium">{new Date(record.due_date).toLocaleDateString()}</div>
                  </div>
                  {record.days_outstanding !== undefined && (
                    <div>
                      <div className="text-muted-foreground">Days Outstanding</div>
                      <div className={`font-medium ${record.days_outstanding > 0 ? 'text-destructive' : ''}`}>
                        {record.days_outstanding}
                      </div>
                    </div>
                  )}
                </div>
                {record.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm">{record.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};