import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';

interface KPI {
  id: string;
  name: string;
  description: string;
  current_value: number;
  target_value: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  created_at: string;
}

export const KPITracking = () => {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    current_value: 0,
    target_value: 0,
    unit: '',
    frequency: 'monthly' as const
  });

  useEffect(() => {
    if (currentCompany) {
      fetchKPIs();
    }
  }, [currentCompany]);

  const fetchKPIs = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKpis((data as KPI[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading KPIs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddKPI = async () => {
    if (!currentCompany || !newKPI.name) return;

    try {
      const { error } = await supabase
        .from('kpis')
        .insert([{
          ...newKPI,
          company_id: currentCompany.id
        }]);

      if (error) throw error;
      
      toast({
        title: "KPI added",
        description: `${newKPI.name} has been added to your KPI dashboard.`
      });
      
      setNewKPI({
        name: '',
        description: '',
        current_value: 0,
        target_value: 0,
        unit: '',
        frequency: 'monthly'
      });
      setIsAddingKPI(false);
      fetchKPIs();
    } catch (error: any) {
      toast({
        title: "Error adding KPI",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getKPIStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'on-track';
    if (percentage >= 75) return 'at-risk';
    return 'behind';
  };

  const getStatusColor = (current: number, target: number) => {
    const status = getKPIStatus(current, target);
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50 border-green-200';
      case 'at-risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'behind': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (current: number, target: number) => {
    const status = getKPIStatus(current, target);
    switch (status) {
      case 'on-track': return CheckCircle;
      case 'at-risk': return AlertCircle;
      case 'behind': return AlertCircle;
      default: return Target;
    }
  };

  const getTrendIcon = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return TrendingUp;
    if (percentage >= 75) return Minus;
    return TrendingDown;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading KPIs...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

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
                  <Label>Description</Label>
                  <Textarea
                    value={newKPI.description}
                    onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
                    placeholder="Describe what this KPI measures..."
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Current Value</Label>
                    <Input
                      type="number"
                      value={newKPI.current_value}
                      onChange={(e) => setNewKPI({ ...newKPI, current_value: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      value={newKPI.target_value}
                      onChange={(e) => setNewKPI({ ...newKPI, target_value: Number(e.target.value) })}
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
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddKPI} 
                  className="w-full"
                  disabled={!newKPI.name || !newKPI.target_value}
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
              {kpis.filter(k => getKPIStatus(k.current_value, k.target_value) === 'on-track').length}
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
              {kpis.filter(k => getKPIStatus(k.current_value, k.target_value) === 'at-risk').length}
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
              {kpis.filter(k => getKPIStatus(k.current_value, k.target_value) === 'behind').length}
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.length === 0 ? (
          <Card className="col-span-full p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold mb-2">No KPIs Defined</h4>
            <p className="text-muted-foreground mb-4">Start tracking your key performance indicators by creating your first KPI.</p>
            <Dialog open={isAddingKPI} onOpenChange={setIsAddingKPI}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First KPI
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        ) : (
          kpis.map((kpi) => {
            const StatusIcon = getStatusIcon(kpi.current_value, kpi.target_value);
            const TrendIcon = getTrendIcon(kpi.current_value, kpi.target_value);
            const progress = getProgressPercentage(kpi.current_value, kpi.target_value);
            const status = getKPIStatus(kpi.current_value, kpi.target_value);
            
            return (
              <Card key={kpi.id} className="border border-muted">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{kpi.name}</h4>
                        {kpi.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {kpi.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendIcon className={`h-4 w-4 ${
                          status === 'on-track' ? 'text-green-600' : 
                          status === 'at-risk' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <Badge variant="outline" className={`text-xs ${getStatusColor(kpi.current_value, kpi.target_value)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {kpi.current_value.toLocaleString()}{kpi.unit}</span>
                        <span>Target: {kpi.target_value.toLocaleString()}{kpi.unit}</span>
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
          })
        )}
      </div>
    </div>
  );
};