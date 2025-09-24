import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KPI {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'behind';
  lastUpdated: string;
}

export const KPITracking = () => {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: '1',
      name: 'Monthly Recurring Revenue',
      category: 'Revenue',
      currentValue: 45000,
      targetValue: 50000,
      unit: '$',
      frequency: 'monthly',
      trend: 'up',
      status: 'on-track',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Customer Acquisition Cost',
      category: 'Marketing',
      currentValue: 125,
      targetValue: 100,
      unit: '$',
      frequency: 'monthly',
      trend: 'up',
      status: 'at-risk',
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      name: 'Customer Lifetime Value',
      category: 'Revenue',
      currentValue: 850,
      targetValue: 1000,
      unit: '$',
      frequency: 'quarterly',
      trend: 'up',
      status: 'on-track',
      lastUpdated: '2024-01-10'
    },
    {
      id: '4',
      name: 'Gross Margin',
      category: 'Financial',
      currentValue: 68,
      targetValue: 75,
      unit: '%',
      frequency: 'monthly',
      trend: 'stable',
      status: 'behind',
      lastUpdated: '2024-01-12'
    },
    {
      id: '5',
      name: 'Employee Satisfaction',
      category: 'Operations',
      currentValue: 4.2,
      targetValue: 4.5,
      unit: '/5',
      frequency: 'quarterly',
      trend: 'up',
      status: 'on-track',
      lastUpdated: '2024-01-01'
    }
  ]);
  
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [newKPI, setNewKPI] = useState({
    name: '',
    category: '',
    currentValue: '',
    targetValue: '',
    unit: '',
    frequency: 'monthly' as const
  });

  const categories = ['Revenue', 'Marketing', 'Financial', 'Operations', 'Customer', 'Product'];

  const handleAddKPI = () => {
    const kpi: KPI = {
      id: Date.now().toString(),
      name: newKPI.name,
      category: newKPI.category,
      currentValue: parseFloat(newKPI.currentValue),
      targetValue: parseFloat(newKPI.targetValue),
      unit: newKPI.unit,
      frequency: newKPI.frequency,
      trend: 'stable',
      status: 'on-track',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setKpis([...kpis, kpi]);
    setIsAddingKPI(false);
    setNewKPI({
      name: '',
      category: '',
      currentValue: '',
      targetValue: '',
      unit: '',
      frequency: 'monthly'
    });
    
    toast({
      title: "KPI added",
      description: `${newKPI.name} has been added to your KPI dashboard.`
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50 border-green-200';
      case 'at-risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'behind': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return CheckCircle;
      case 'at-risk': return AlertCircle;
      case 'behind': return AlertCircle;
      default: return Target;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Target;
    }
  };

  const groupedKPIs = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.category]) acc[kpi.category] = [];
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, KPI[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">KPI Tracking & Goals</h3>
          <p className="text-sm text-muted-foreground">
            Monitor key performance indicators and track progress towards your goals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddingKPI} onOpenChange={setIsAddingKPI}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New KPI</DialogTitle>
                <DialogDescription>
                  Create a new key performance indicator to track
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>KPI Name</Label>
                  <Input
                    value={newKPI.name}
                    onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                    placeholder="e.g., Monthly Revenue"
                  />
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select value={newKPI.category} onValueChange={(value) => setNewKPI({ ...newKPI, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Current Value</Label>
                    <Input
                      type="number"
                      value={newKPI.currentValue}
                      onChange={(e) => setNewKPI({ ...newKPI, currentValue: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      value={newKPI.targetValue}
                      onChange={(e) => setNewKPI({ ...newKPI, targetValue: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={newKPI.unit}
                      onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
                      placeholder="$, %, units"
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={newKPI.frequency} onValueChange={(value: any) => setNewKPI({ ...newKPI, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddKPI} 
                  className="w-full"
                  disabled={!newKPI.name || !newKPI.category || !newKPI.currentValue || !newKPI.targetValue}
                >
                  Add KPI
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kpis.filter(k => k.status === 'on-track').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {kpis.filter(k => k.status === 'at-risk').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Behind
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kpis.filter(k => k.status === 'behind').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Categories */}
      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category} KPIs</CardTitle>
            <CardDescription>
              Key performance indicators for {category.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryKPIs.map((kpi) => {
                const StatusIcon = getStatusIcon(kpi.status);
                const TrendIcon = getTrendIcon(kpi.trend);
                const progress = getProgressPercentage(kpi.currentValue, kpi.targetValue);
                
                return (
                  <Card key={kpi.id} className="border border-muted">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{kpi.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Updated {new Date(kpi.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendIcon className={`h-4 w-4 ${
                              kpi.trend === 'up' ? 'text-green-600' : 
                              kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                            <Badge variant="outline" className={`text-xs ${getStatusColor(kpi.status)}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {kpi.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current: {kpi.unit}{kpi.currentValue.toLocaleString()}</span>
                            <span>Target: {kpi.unit}{kpi.targetValue.toLocaleString()}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-muted-foreground text-center">
                            {progress.toFixed(1)}% of target achieved
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Frequency: {kpi.frequency}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};