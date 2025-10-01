import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Building2 } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PLData {
  id: string;
  account_name: string;
  account_type: string;
  current_month: number;
  quarter_to_date: number;
  year_to_date: number;
  budget_current_month: number;
  budget_quarter_to_date: number;
  budget_year_to_date: number;
  variance_current_month: number;
  variance_quarter_to_date: number;
  variance_year_to_date: number;
  fiscal_year: number;
  fiscal_quarter: number;
  fiscal_month: number;
  report_date: string;
}

export const QBOProfitLoss = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [plData, setPlData] = useState<PLData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState<'current_month' | 'quarter_to_date' | 'year_to_date'>('year_to_date');

  useEffect(() => {
    if (currentCompany) {
      loadPLData();
    }
  }, [currentCompany, selectedYear]);

  const loadPLData = async () => {
    if (!currentCompany) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('qbo_profit_loss')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('fiscal_year', selectedYear)
        .order('fiscal_month', { ascending: true })
        .order('account_name', { ascending: true });

      if (error) throw error;

      // Calculate QTD and YTD from monthly data
      const processedData = calculateAggregatedData(data || []);
      setPlData(processedData);
    } catch (error: any) {
      toast({
        title: "Error loading P&L data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAggregatedData = (rawData: any[]): PLData[] => {
    // Group by account and aggregate
    const accountGroups = rawData.reduce((acc, item) => {
      const key = `${item.account_name}-${item.account_type}`;
      if (!acc[key]) {
        acc[key] = {
          ...item,
          monthlyData: []
        };
      }
      acc[key].monthlyData.push({
        month: item.fiscal_month,
        amount: item.current_month || 0
      });
      return acc;
    }, {} as Record<string, any>);

    // Calculate aggregations for each account
    return Object.values(accountGroups).map((group: any) => {
      const currentMonth = group.current_month || 0;
      const currentMonthNumber = new Date().getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonthNumber / 3);
      const quarterStartMonth = (currentQuarter - 1) * 3 + 1;
      
      // Sum all months for YTD
      const year_to_date = group.monthlyData.reduce((sum: number, m: any) => sum + Math.abs(m.amount), 0);
      
      // Sum only current quarter months for QTD
      const quarter_to_date = group.monthlyData
        .filter((m: any) => m.month >= quarterStartMonth && m.month <= currentMonthNumber)
        .reduce((sum: number, m: any) => sum + Math.abs(m.amount), 0);

      return {
        ...group,
        current_month: currentMonth,
        quarter_to_date,
        year_to_date,
        budget_current_month: group.budget_current_month || 0,
        budget_quarter_to_date: group.budget_quarter_to_date || 0,
        budget_year_to_date: group.budget_year_to_date || 0,
        variance_current_month: currentMonth - (group.budget_current_month || 0),
        variance_quarter_to_date: quarter_to_date - (group.budget_quarter_to_date || 0),
        variance_year_to_date: year_to_date - (group.budget_year_to_date || 0)
      };
    });
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
        description: `Successfully synced P&L data. ${data.plDataCount || 0} P&L entries processed.`,
      });

      loadPLData();
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
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'cost_of_goods_sold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  // Group data by account type
  const groupedData = plData.reduce((acc, item) => {
    const type = item.account_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, PLData[]>);

  // Calculate totals by aggregating account groups properly
  const calculateTotal = (type: string, field: string) => {
    return groupedData[type]?.reduce((sum, item) => {
      const value = item[field as keyof PLData] as number;
      return sum + Math.abs(value || 0);
    }, 0) || 0;
  };

  const totalRevenue = calculateTotal('revenue', selectedView);
  const totalExpenses = calculateTotal('expense', selectedView) + calculateTotal('cost_of_goods_sold', selectedView);
  const netIncome = totalRevenue - totalExpenses;

  const availableYears = [...new Set(plData.map(item => item.fiscal_year))].sort((a, b) => b - a);
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getViewLabel = () => {
    switch (selectedView) {
      case 'current_month': return 'Current Month';
      case 'quarter_to_date': return 'Quarter to Date';
      case 'year_to_date': return 'Year to Date';
      default: return 'Year to Date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Profit & Loss Statement
          </h3>
          <p className="text-sm text-muted-foreground">
            Your actual financial performance from QuickBooks Online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="quarter_to_date">Quarter to Date</SelectItem>
              <SelectItem value="year_to_date">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadPLData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync P&L Data'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getViewLabel()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getViewLabel()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {netIncome >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-600" /> : 
                <TrendingDown className="h-4 w-4 text-red-600" />
              }
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getViewLabel()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Profit & Loss - {selectedYear}</CardTitle>
          <CardDescription>
            {getViewLabel()} financial performance by account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No P&L data found for {selectedYear}. Try syncing your QuickBooks Online data.
              </p>
              <Button onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync QBO Data
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedData).map(([accountType, accounts]) => (
                <div key={accountType}>
                  <h4 className="font-semibold text-lg mb-3 capitalize flex items-center gap-2">
                    <Badge className={getAccountTypeColor(accountType)}>
                      {accountType.replace('_', ' ')}
                    </Badge>
                    ({accounts.length} accounts)
                  </h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account Name</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Budget</TableHead>
                          <TableHead className="text-right">Variance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => {
                          const amount = account[selectedView] as number;
                          const budget = account[`budget_${selectedView}`] as number;
                          const variance = account[`variance_${selectedView}`] as number;
                          
                          return (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">
                                {account.account_name}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(amount)}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {budget ? formatCurrency(budget) : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {getVarianceIcon(variance)}
                                  <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(Math.abs(variance))}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="border-t-2 bg-muted/30">
                          <TableCell className="font-bold">
                            {accountType.replace('_', ' ').toUpperCase()} TOTAL
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(calculateTotal(accountType, selectedView))}
                          </TableCell>
                          <TableCell className="text-right font-bold text-muted-foreground">
                            {formatCurrency(calculateTotal(accountType, `budget_${selectedView}`))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            <div className="flex items-center justify-end gap-1">
                              {getVarianceIcon(calculateTotal(accountType, `variance_${selectedView}`))}
                              <span className={calculateTotal(accountType, `variance_${selectedView}`) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(Math.abs(calculateTotal(accountType, `variance_${selectedView}`)))}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
              
              {/* Net Income Row */}
              <div className="border-t-2 pt-4">
                <Table>
                  <TableBody>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-bold text-lg">NET INCOME</TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(netIncome)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-muted-foreground">
                        {formatCurrency(calculateTotal('revenue', `budget_${selectedView}`) - 
                          calculateTotal('expense', `budget_${selectedView}`) - 
                          calculateTotal('cost_of_goods_sold', `budget_${selectedView}`))}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        <div className="flex items-center justify-end gap-1">
                          {getVarianceIcon(netIncome)}
                          <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(netIncome))}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};