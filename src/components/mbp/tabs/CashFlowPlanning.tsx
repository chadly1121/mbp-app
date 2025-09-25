import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Banknote, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CashFlowData {
  month: string;
  openingBalance: number;
  cashInflows: number;
  cashOutflows: number;
  netCashFlow: number;
  closingBalance: number;
  cumulativeCashFlow: number;
}

export const CashFlowPlanning = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany) {
      fetchCashFlowData();
    }
  }, [currentCompany, selectedYear]);

  const fetchCashFlowData = async () => {
    if (!currentCompany) return;

    try {
      // Fetch revenue forecasts for the year
      const { data: revenueForecast, error: revenueError } = await supabase
        .from('revenue_forecasts')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('year', selectedYear)
        .order('month');

      // Fetch budget plans for expenses
      const { data: budgetPlans, error: budgetError } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('year', selectedYear)
        .eq('category', 'Expenses')
        .order('month_number');

      if (revenueError) throw revenueError;
      if (budgetError) throw budgetError;

      // Calculate cash flow data from forecasts and budgets
      const monthlyData: CashFlowData[] = [];
      let runningBalance = 50000; // Starting balance - could be configurable

      for (let month = 1; month <= 12; month++) {
        const monthName = new Date(selectedYear, month - 1).toLocaleDateString('en-US', { month: 'short' });
        
        const monthRevenue = revenueForecast?.filter(r => r.month === month)
          .reduce((sum, r) => sum + (r.forecasted_amount || 0), 0) || 0;
        
        const monthExpenses = budgetPlans?.filter(b => b.month_number === month)
          .reduce((sum, b) => sum + (b.budgeted_amount || 0), 0) || 0;

        const netCashFlow = monthRevenue - monthExpenses;
        const closingBalance = runningBalance + netCashFlow;

        monthlyData.push({
          month: monthName,
          openingBalance: runningBalance,
          cashInflows: monthRevenue,
          cashOutflows: monthExpenses,
          netCashFlow: netCashFlow,
          closingBalance: closingBalance,
          cumulativeCashFlow: closingBalance - 50000 // Cumulative from starting balance
        });

        runningBalance = closingBalance;
      }

      setCashFlowData(monthlyData);
    } catch (error: any) {
      toast({
        title: "Error loading cash flow data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalInflows = cashFlowData.reduce((sum, data) => sum + data.cashInflows, 0);
  const totalOutflows = cashFlowData.reduce((sum, data) => sum + data.cashOutflows, 0);
  const totalNetCashFlow = totalInflows - totalOutflows;
  const finalBalance = cashFlowData[cashFlowData.length - 1]?.closingBalance || 0;
  
  const getHealthStatus = (balance: number) => {
    if (balance > 100000) return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (balance > 50000) return { status: 'Good', color: 'text-blue-600', icon: TrendingUp };
    if (balance > 25000) return { status: 'Fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'Poor', color: 'text-red-600', icon: TrendingDown };
  };

  const healthStatus = getHealthStatus(finalBalance);
  const HealthIcon = healthStatus.icon;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading cash flow data...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Cash Flow Planning</h3>
          <p className="text-sm text-muted-foreground">
            Monitor and project your cash flow to ensure healthy liquidity
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Inflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              ${totalInflows.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Outflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              ${totalOutflows.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Net Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${totalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalNetCashFlow.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Ending Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              ${finalBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HealthIcon className="h-4 w-4" />
              Cash Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={healthStatus.color}>
              {healthStatus.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow Statement - {selectedYear}</CardTitle>
          <CardDescription>
            Track cash inflows, outflows, and running balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Cash Inflows</TableHead>
                  <TableHead className="text-right">Cash Outflows</TableHead>
                  <TableHead className="text-right">Net Cash Flow</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                  <TableHead className="text-right">Cumulative</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlowData.map((data, index) => (
                  <TableRow key={data.month}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell className="text-right">
                      ${data.openingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      +${data.cashInflows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -${data.cashOutflows.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.netCashFlow >= 0 ? '+' : ''}${data.netCashFlow.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${data.closingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      data.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.cumulativeCashFlow >= 0 ? '+' : ''}${data.cumulativeCashFlow.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Cash Flow Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finalBalance < 25000 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">Low Cash Warning</div>
                    <div className="text-sm text-red-700">
                      Ending cash balance is below recommended minimum. Consider increasing inflows or reducing expenses.
                    </div>
                  </div>
                </div>
              )}
              
              {totalNetCashFlow < 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Negative Cash Flow</div>
                    <div className="text-sm text-yellow-700">
                      Total outflows exceed inflows for this year. Review revenue projections and expense budgets.
                    </div>
                  </div>
                </div>
              )}
              
              {totalNetCashFlow > 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Positive Cash Flow</div>
                    <div className="text-sm text-green-700">
                      Strong cash generation expected for {selectedYear}. Consider investment opportunities.
                    </div>
                  </div>
                </div>
              )}

              {cashFlowData.length === 0 && (
                <div className="text-center py-6">
                  <Banknote className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No cash flow data available</p>
                  <p className="text-sm text-muted-foreground">Add revenue forecasts and budget plans to see cash flow projections.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Metrics</CardTitle>
            <CardDescription>Important cash flow ratios and indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Monthly Inflow</span>
              <span className="font-semibold">${cashFlowData.length > 0 ? (totalInflows / cashFlowData.length).toLocaleString() : '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Monthly Outflow</span>
              <span className="font-semibold">${cashFlowData.length > 0 ? (totalOutflows / cashFlowData.length).toLocaleString() : '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cash Flow Ratio</span>
              <span className={`font-semibold ${totalOutflows > 0 ? (totalInflows / totalOutflows >= 1.1 ? 'text-green-600' : 'text-red-600') : ''}`}>
                {totalOutflows > 0 ? (totalInflows / totalOutflows).toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Months of Coverage</span>
              <span className="font-semibold">
                {totalOutflows > 0 && cashFlowData.length > 0 
                  ? Math.round((finalBalance / (totalOutflows / cashFlowData.length)) * 10) / 10 
                  : 'N/A'} months
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};