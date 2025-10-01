import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Building2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QBOAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  qbo_id: string;
  is_active: boolean;
  balance?: number;
}

interface QBOProduct {
  id: string;
  name: string;
  description: string;
  unit_price: number;
  qbo_id: string;
  product_type: string;
}

export const QBOFinancialData = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<QBOAccount[]>([]);
  const [products, setProducts] = useState<QBOProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showInactiveAccounts, setShowInactiveAccounts] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      loadQBOData();
    }
  }, [currentCompany]);

  const loadQBOData = async () => {
    if (!currentCompany) return;

    try {
      setLoading(true);
      
      // Load QBO accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('company_id', currentCompany.id)
        .not('qbo_id', 'is', null)
        .order('account_type', { ascending: true })
        .order('account_name', { ascending: true });

      if (accountsError) throw accountsError;

      // Load QBO products/services
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', currentCompany.id)
        .not('qbo_id', 'is', null)
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      setAccounts(accountsData || []);
      setProducts(productsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading QBO data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentCompany) return;

    try {
      setSyncing(true);
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.functions.invoke('qbo-sync', {
        body: { companyId: currentCompany.id },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Sync completed",
        description: `Successfully synced ${data.itemsCount || 0} items and ${data.accountsCount || 0} accounts from QuickBooks Online`,
      });

      loadQBOData();
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      case 'service': return 'bg-cyan-100 text-cyan-800';
      case 'inventory': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!showInactiveAccounts && !account.is_active) return acc;
    
    const type = account.account_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, QBOAccount[]>);

  const filteredAccounts = showInactiveAccounts ? accounts : accounts.filter(a => a.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            QuickBooks Online Financial Data
          </h3>
          <p className="text-sm text-muted-foreground">
            View your synced accounts and products from QuickBooks Online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowInactiveAccounts(!showInactiveAccounts)}
            variant="outline"
            size="sm"
          >
            {showInactiveAccounts ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showInactiveAccounts ? 'Hide Inactive' : 'Show Inactive'}
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync QBO Data'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.filter(a => !a.is_active).length} inactive
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Products/Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {products.filter(p => p.product_type === 'Service').length} services, {products.filter(p => p.product_type === 'Inventory').length} inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accounts.filter(a => a.account_type === 'revenue' && a.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expense Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {accounts.filter(a => a.account_type === 'expense' && a.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="products">Products & Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>
                Your synced chart of accounts from QuickBooks Online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedAccounts).map(([accountType, typeAccounts]) => (
                  <div key={accountType}>
                    <h4 className="font-semibold text-lg mb-3 capitalize">
                      {accountType} ({typeAccounts.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>QBO ID</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typeAccounts.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">
                                {account.account_name}
                              </TableCell>
                              <TableCell>{account.account_code}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {account.qbo_id}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={account.is_active ? "default" : "secondary"}
                                  className={account.is_active ? "bg-green-100 text-green-800" : ""}
                                >
                                  {account.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
              <CardDescription>
                Your synced products and services from QuickBooks Online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>QBO ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.description || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getAccountTypeColor(product.product_type)}>
                            {product.product_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.unit_price ? `$${product.unit_price.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.qbo_id}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {products.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products or services found. Try syncing your QBO data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};