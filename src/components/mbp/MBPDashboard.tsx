import { useState, useEffect } from 'react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Product {
  id: string;
  name: string;
  description?: string;
  product_type: string; // Changed from union type to string
  unit_price?: number;
  is_active: boolean;
}

interface MonthlyBudget {
  id: string;
  product_id: string;
  account_id: string;
  budget_year: number;
  budget_month: number;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percent: number;
  products?: { name: string };
  chart_of_accounts?: { account_name: string };
}

const MBPDashboard = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productType, setProductType] = useState<'product' | 'service'>('product');
  const [unitPrice, setUnitPrice] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchProducts();
      fetchBudgets();
    }
  }, [currentCompany, selectedYear, selectedMonth]);

  const fetchProducts = async () => {
    if (!currentCompany) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', currentCompany.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const fetchBudgets = async () => {
    if (!currentCompany) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('monthly_budgets')
      .select(`
        *,
        products:product_id (name),
        chart_of_accounts:account_id (account_name)
      `)
      .eq('company_id', currentCompany.id)
      .eq('budget_year', selectedYear)
      .eq('budget_month', selectedMonth)
      .order('budgeted_amount', { ascending: false });

    if (error) {
      toast({
        title: "Error loading budgets",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBudgets(data || []);
    }
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;

    const { error } = await supabase
      .from('products')
      .insert([
        {
          company_id: currentCompany.id,
          name: productName,
          description: productDescription || null,
          product_type: productType,
          unit_price: unitPrice ? parseFloat(unitPrice) : null,
        },
      ]);

    if (error) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product added successfully",
        description: `${productName} has been added to your products.`,
      });
      setIsAddingProduct(false);
      setProductName('');
      setProductDescription('');
      setUnitPrice('');
      fetchProducts();
    }
  };

  const calculateTotals = () => {
    return budgets.reduce((acc, budget) => ({
      totalBudgeted: acc.totalBudgeted + budget.budgeted_amount,
      totalActual: acc.totalActual + budget.actual_amount,
      totalVariance: acc.totalVariance + budget.variance_amount,
    }), { totalBudgeted: 0, totalActual: 0, totalVariance: 0 });
  };

  const totals = calculateTotals();

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a company to view MBP data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile/Desktop Header with controls */}
      <div className="space-y-4">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            {!isMobile && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Monthly Business Planning
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Track budget vs actual performance by product - {currentCompany?.name}
                </p>
              </>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Year/Month Selectors */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-20 md:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-24 md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {isMobile ? month.slice(0, 3) : month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Product Button */}
            <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "sm" : "default"}>
                  <Plus className="h-4 w-4 mr-1 md:mr-2" />
                  {isMobile ? 'Add' : 'Add Product'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product/Service</DialogTitle>
                  <DialogDescription>
                    Add a product or service to track in your MBP analysis
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product/Service Name</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productDescription">Description (optional)</Label>
                    <Input
                      id="productDescription"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productType">Type</Label>
                    <Select value={productType} onValueChange={(value: 'product' | 'service') => setProductType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price (optional)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Product</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Summary Cards - Mobile: Single column, Desktop: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Budgeted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold">${totals.totalBudgeted.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className="text-lg md:text-2xl font-bold">${totals.totalActual.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Variance</CardTitle>
            {totals.totalVariance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent className="pb-3 md:pb-6">
            <div className={`text-lg md:text-2xl font-bold ${totals.totalVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${totals.totalVariance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products & Services ({products.length})
          </CardTitle>
          <CardDescription>
            Manage your products and services for MBP tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm md:text-base">No products added yet. Add your first product to start tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <Card key={product.id} className="border border-muted">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm md:text-base truncate mr-2">{product.name}</h4>
                      <Badge variant={product.product_type === 'product' ? 'default' : 'secondary'} className="text-xs shrink-0">
                         {product.product_type}
                      </Badge>
                    </div>
                    {product.description && (
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    )}
                    {product.unit_price && (
                      <p className="text-xs md:text-sm font-medium">${product.unit_price.toFixed(2)}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MBP Analysis Table - Mobile: Horizontal scroll, Desktop: Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            {months[selectedMonth - 1]} {selectedYear} - Budget vs Actual Analysis
          </CardTitle>
          <CardDescription className="text-sm">
            Detailed breakdown by product and account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 md:px-6">
          {loading ? (
            <div className="text-center py-8 px-6">
              <div className="text-sm md:text-base">Loading budget data...</div>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-6">
              <DollarSign className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm md:text-base">No budget data found for {months[selectedMonth - 1]} {selectedYear}.</p>
              <p className="text-xs md:text-sm mt-1">Budget entries will appear here once you start adding financial data.</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[600px] md:min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs md:text-sm w-[120px] md:w-auto">Product</TableHead>
                      <TableHead className="text-xs md:text-sm w-[120px] md:w-auto">Account</TableHead>
                      <TableHead className="text-right text-xs md:text-sm w-[80px] md:w-auto">Budgeted</TableHead>
                      <TableHead className="text-right text-xs md:text-sm w-[80px] md:w-auto">Actual</TableHead>
                      <TableHead className="text-right text-xs md:text-sm w-[80px] md:w-auto">Variance</TableHead>
                      <TableHead className="text-right text-xs md:text-sm w-[70px] md:w-auto">Var %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium text-xs md:text-sm">
                          <div className="truncate max-w-[100px] md:max-w-none" title={budget.products?.name || 'Unknown Product'}>
                            {budget.products?.name || 'Unknown Product'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <div className="truncate max-w-[100px] md:max-w-none" title={budget.chart_of_accounts?.account_name || 'Unknown Account'}>
                            {budget.chart_of_accounts?.account_name || 'Unknown Account'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm">
                          ${budget.budgeted_amount.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm">
                          ${budget.actual_amount.toFixed(0)}
                        </TableCell>
                        <TableCell className={`text-right text-xs md:text-sm ${budget.variance_amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${budget.variance_amount.toFixed(0)}
                        </TableCell>
                        <TableCell className={`text-right text-xs md:text-sm ${budget.variance_percent >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {budget.variance_percent.toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MBPDashboard;