import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calculator, Building2 } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QBOFinancialData } from '@/components/integrations/QBOFinancialData';

import React from 'react';

interface BudgetLine {
  id: string;
  category: string;
  subcategory: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  total: number;
}

export const FinancialPlanning = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Form state
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [monthlyValues, setMonthlyValues] = useState({
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories = ['Revenue', 'Cost of Goods Sold', 'Operating Expenses', 'Marketing', 'Personnel', 'Other'];

  useEffect(() => {
    if (currentCompany) {
      loadBudgetData();
    }
  }, [currentCompany, selectedYear]);

  const loadBudgetData = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('year', selectedYear)
        .order('category', { ascending: true });

      if (error) throw error;

      // Group by category and subcategory, then create annual lines
      const groupedData = (data || []).reduce((acc: any, item: any) => {
        const key = `${item.category}-${item.subcategory || item.account_name}`;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            category: item.category,
            subcategory: item.subcategory || item.account_name,
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
            jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
            total: 0
          };
        }
        
        // Map month number to month name
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthKey = monthNames[item.month_number - 1];
        acc[key][monthKey] = item.budgeted_amount;
        acc[key].total += item.budgeted_amount;
        
        return acc;
      }, {});

      setBudgetLines(Object.values(groupedData));
    } catch (error: any) {
      toast({
        title: "Error loading budget data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddBudgetLine = async () => {
    if (!currentCompany) return;

    try {
      // Create budget entries for each month
      const budgetEntries = Object.entries(monthlyValues).map(([month, amount], index) => ({
        company_id: currentCompany.id,
        category,
        subcategory,
        account_name: subcategory,
        year: selectedYear,
        month_number: index + 1,
        budgeted_amount: amount,
        actual_amount: 0,
        variance_amount: -amount,
        variance_percent: amount > 0 ? -100 : 0
      }));

      const { error } = await supabase
        .from('budget_plans')
        .insert(budgetEntries);

      if (error) throw error;

      toast({
        title: "Budget line added",
        description: `${category} - ${subcategory} has been added to your budget.`
      });

      setIsAddingLine(false);
      setCategory('');
      setSubcategory('');
      setMonthlyValues({
        jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
        jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      });
      
      loadBudgetData();
    } catch (error: any) {
      toast({
        title: "Error adding budget line",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateCategoryTotals = (cat: string) => {
    return budgetLines
      .filter(line => line.category === cat)
      .reduce((sum, line) => sum + line.total, 0);
  };

  const calculateNetIncome = () => {
    const revenue = calculateCategoryTotals('Revenue');
    const expenses = budgetLines
      .filter(line => line.category !== 'Revenue')
      .reduce((sum, line) => sum + line.total, 0);
    return revenue - expenses;
  };

  const groupedLines = budgetLines.reduce((acc, line) => {
    if (!acc[line.category]) acc[line.category] = [];
    acc[line.category].push(line);
    return acc;
  }, {} as Record<string, BudgetLine[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Financial Planning</h3>
          <p className="text-sm text-muted-foreground">
            View your QuickBooks Online data and manage your budget planning
          </p>
        </div>
      </div>

      {/* Financial Data Tabs */}
      <Tabs defaultValue="qbo-data" className="w-full">
        <TabsList>
          <TabsTrigger value="qbo-data">QuickBooks Online Data</TabsTrigger>
          <TabsTrigger value="budget-planning">Budget Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qbo-data">
          <QBOFinancialData />
        </TabsContent>
        
        <TabsContent value="budget-planning">
          <div className="space-y-6">
            {/* Budget Planning Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold">Budget Planning</h4>
                <p className="text-sm text-muted-foreground">
                  Plan your annual budget with monthly breakdown
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
          
          <Dialog open={isAddingLine} onOpenChange={setIsAddingLine}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Budget Line
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Budget Line</DialogTitle>
                <DialogDescription>
                  Add a new budget line with monthly values
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subcategory</Label>
                    <Input
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g., Product Sales, Office Rent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {months.map((month, index) => {
                    const key = month.toLowerCase() as keyof typeof monthlyValues;
                    return (
                      <div key={month}>
                        <Label className="text-xs">{month}</Label>
                        <Input
                          type="number"
                          value={monthlyValues[key]}
                          onChange={(e) => setMonthlyValues({
                            ...monthlyValues,
                            [key]: parseFloat(e.target.value) || 0
                          })}
                          className="text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddBudgetLine} disabled={!category || !subcategory}>
                    Add Budget Line
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
              </div>
            </div>

            {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${calculateCategoryTotals('Revenue').toLocaleString()}
            </div>
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
              ${budgetLines.filter(l => l.category !== 'Revenue').reduce((sum, l) => sum + l.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculateNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${calculateNetIncome().toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {calculateNetIncome() >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-600" /> : 
                <TrendingDown className="h-4 w-4 text-red-600" />
              }
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculateNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateCategoryTotals('Revenue') > 0 ? 
                ((calculateNetIncome() / calculateCategoryTotals('Revenue')) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Budget Breakdown - {selectedYear}</CardTitle>
          <CardDescription>Monthly budget planning by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead className="w-40">Subcategory</TableHead>
                  {months.map(month => (
                    <TableHead key={month} className="text-right w-20">{month}</TableHead>
                  ))}
                  <TableHead className="text-right w-24 font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedLines).map(([category, lines]) => (
                  <React.Fragment key={category}>
                    {lines.map((line, index) => (
                      <TableRow key={line.id} className={index === 0 ? 'border-t-2' : ''}>
                        {index === 0 && (
                          <TableCell 
                            rowSpan={lines.length} 
                            className="font-semibold bg-muted/50 border-r"
                          >
                            {category}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{line.subcategory}</TableCell>
                        {months.map((month) => {
                          const key = month.toLowerCase() as keyof BudgetLine;
                          return (
                            <TableCell key={month} className="text-right">
                              ${(line[key] as number).toLocaleString()}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-semibold">
                          ${line.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-b-2 bg-muted/30">
                      <TableCell className="font-bold">{category} Total</TableCell>
                      {months.map((month) => {
                        const monthTotal = lines.reduce((sum, line) => {
                          const key = month.toLowerCase() as keyof BudgetLine;
                          return sum + (line[key] as number);
                        }, 0);
                        return (
                          <TableCell key={month} className="text-right font-semibold">
                            ${monthTotal.toLocaleString()}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-bold">
                        ${calculateCategoryTotals(category).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};