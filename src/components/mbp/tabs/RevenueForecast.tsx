import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, Package, DollarSign, Target } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RevenueForecastLine {
  id: string;
  product: string;
  unitPrice: number;
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
  totalUnits: number;
  totalRevenue: number;
}

export const RevenueForecast = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [forecastLines, setForecastLines] = useState<RevenueForecastLine[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [monthlyUnits, setMonthlyUnits] = useState({
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (currentCompany) {
      loadProducts();
      loadForecastData();
    }
  }, [currentCompany, selectedYear]);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', currentCompany?.id)
      .eq('is_active', true);
    
    if (!error) {
      setProducts(data || []);
    }
  };

  const loadForecastData = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('revenue_forecasts')
        .select(`
          *,
          products (name, unit_price)
        `)
        .eq('company_id', currentCompany.id)
        .eq('year', selectedYear)
        .order('product_id', { ascending: true });

      if (error) throw error;

      // Group by product and create annual lines
      const groupedData = (data || []).reduce((acc: any, item: any) => {
        const productName = item.products?.name || `Product ${item.product_id}`;
        const productPrice = item.products?.unit_price || 0;
        
        if (!acc[productName]) {
          acc[productName] = {
            id: productName,
            product: productName,
            unitPrice: productPrice,
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
            jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
            totalUnits: 0,
            totalRevenue: 0
          };
        }
        
        // Map month number to month name and calculate units from forecasted amount
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthKey = monthNames[item.month - 1];
        const units = productPrice > 0 ? Math.round(item.forecasted_amount / productPrice) : 0;
        
        acc[productName][monthKey] = units;
        acc[productName].totalUnits += units;
        acc[productName].totalRevenue += item.forecasted_amount;
        
        return acc;
      }, {});

      setForecastLines(Object.values(groupedData));
    } catch (error: any) {
      toast({
        title: "Error loading forecast data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddForecastLine = async () => {
    if (!currentCompany) return;

    try {
      const price = parseFloat(unitPrice);
      let productId = null;

      // Find or create product
      if (selectedProduct !== 'custom') {
        const product = products.find(p => p.name === selectedProduct);
        productId = product?.id;
      }

      // Create forecast entries for each month
      const forecastEntries = Object.entries(monthlyUnits).map(([month, units], index) => ({
        company_id: currentCompany.id,
        product_id: productId,
        year: selectedYear,
        month: index + 1,
        forecasted_amount: units * price,
        actual_amount: 0
      }));

      const { error } = await supabase
        .from('revenue_forecasts')
        .insert(forecastEntries);

      if (error) throw error;

      toast({
        title: "Revenue forecast added",
        description: `${selectedProduct} forecast has been added.`
      });

      setIsAddingLine(false);
      setSelectedProduct('');
      setUnitPrice('');
      setMonthlyUnits({
        jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
        jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      });
      
      loadForecastData();
    } catch (error: any) {
      toast({
        title: "Error adding forecast",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateMonthlyTotals = () => {
    return months.reduce((acc, month) => {
      const key = month.toLowerCase() as keyof typeof monthlyUnits;
      const monthlyRevenue = forecastLines.reduce((sum, line) => {
        return sum + ((line[key] as number) * line.unitPrice);
      }, 0);
      acc[month] = monthlyRevenue;
      return acc;
    }, {} as Record<string, number>);
  };

  const totalRevenue = forecastLines.reduce((sum, line) => sum + line.totalRevenue, 0);
  const totalUnits = forecastLines.reduce((sum, line) => sum + line.totalUnits, 0);
  const avgUnitPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;
  const monthlyTotals = calculateMonthlyTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Revenue Forecast</h3>
          <p className="text-sm text-muted-foreground">
            Plan your revenue by product with unit sales forecasting
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
                Add Product Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Product Revenue Forecast</DialogTitle>
                <DialogDescription>
                  Forecast monthly unit sales for a product or service
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product/Service</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Add Custom Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="199.99"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-3 block">Monthly Unit Sales Forecast</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {months.map((month, index) => {
                      const key = month.toLowerCase() as keyof typeof monthlyUnits;
                      return (
                        <div key={month}>
                          <Label className="text-xs">{month}</Label>
                          <Input
                            type="number"
                            value={monthlyUnits[key]}
                            onChange={(e) => setMonthlyUnits({
                              ...monthlyUnits,
                              [key]: parseInt(e.target.value) || 0
                            })}
                            className="text-sm"
                            placeholder="0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddForecastLine} disabled={!selectedProduct || !unitPrice}>
                    Add Forecast
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
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUnits.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Unit Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgUnitPrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Avg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 12).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast by Product - {selectedYear}</CardTitle>
          <CardDescription>Monthly unit sales and revenue projections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Product</TableHead>
                  <TableHead className="w-24 text-right">Unit Price</TableHead>
                  {months.map(month => (
                    <TableHead key={month} className="text-right w-20">{month}</TableHead>
                  ))}
                  <TableHead className="text-right w-24 font-semibold">Total Units</TableHead>
                  <TableHead className="text-right w-32 font-semibold">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecastLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.product}</TableCell>
                    <TableCell className="text-right">${line.unitPrice}</TableCell>
                    {months.map((month) => {
                      const key = month.toLowerCase() as keyof RevenueForecastLine;
                      const units = line[key] as number;
                      const revenue = units * line.unitPrice;
                      return (
                        <TableCell key={month} className="text-right">
                          <div className="text-sm">
                            <div>{units.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              ${revenue.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-semibold">
                      {line.totalUnits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${line.totalRevenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 bg-muted/30">
                  <TableCell className="font-bold">Monthly Totals</TableCell>
                  <TableCell></TableCell>
                  {months.map((month) => (
                    <TableCell key={month} className="text-right font-semibold">
                      ${monthlyTotals[month]?.toLocaleString() || '0'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold">
                    {totalUnits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${totalRevenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};