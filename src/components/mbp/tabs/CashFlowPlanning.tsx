import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Banknote, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Mock cash flow data - would be calculated from revenue forecast and expense budget
  const cashFlowData: CashFlowData[] = [
    {
      month: 'Jan',
      openingBalance: 50000,
      cashInflows: 85000,
      cashOutflows: 72000,
      netCashFlow: 13000,
      closingBalance: 63000,
      cumulativeCashFlow: 13000
    },
    {
      month: 'Feb',
      openingBalance: 63000,
      cashInflows: 89000,
      cashOutflows: 75000,
      netCashFlow: 14000,
      closingBalance: 77000,
      cumulativeCashFlow: 27000
    },
    {
      month: 'Mar',
      openingBalance: 77000,
      cashInflows: 95000,
      cashOutflows: 82000,
      netCashFlow: 13000,
      closingBalance: 90000,
      cumulativeCashFlow: 40000
    },
    {
      month: 'Apr',
      openingBalance: 90000,
      cashInflows: 98000,
      cashOutflows: 85000,
      netCashFlow: 13000,
      closingBalance: 103000,
      cumulativeCashFlow: 53000
    },
    {
      month: 'May',
      openingBalance: 103000,
      cashInflows: 102000,
      cashOutflows: 88000,
      netCashFlow: 14000,
      closingBalance: 117000,
      cumulativeCashFlow: 67000
    },
    {
      month: 'Jun',
      openingBalance: 117000,
      cashInflows: 105000,
      cashOutflows: 92000,
      netCashFlow: 13000,
      closingBalance: 130000,
      cumulativeCashFlow: 80000
    }
  ];

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
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Seasonal Dip Expected</div>
                <div className="text-sm text-yellow-700">
                  Q1 typically shows slower cash inflows. Consider maintaining higher reserves.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Strong Growth Trend</div>
                <div className="text-sm text-green-700">
                  Monthly inflows showing consistent 5% growth pattern.
                </div>
              </div>
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
              <span className="text-sm font-medium">Operating Cash Flow Ratio</span>
              <span className="font-semibold text-green-600">1.18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cash Conversion Cycle</span>
              <span className="font-semibold">32 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Free Cash Flow Margin</span>
              <span className="font-semibold text-green-600">15.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cash Coverage Ratio</span>
              <span className="font-semibold">2.8x</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};