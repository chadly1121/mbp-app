import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Minus, RefreshCw } from 'lucide-react';
import { BaseMBPTab } from '@/components/mbp/shared/BaseMBPTab';
import { FormDialog } from '@/components/mbp/tabs/shared/FormDialog';
import { useKPIs } from '@/hooks/useKPIs';
import { KPIFormData, getKPIStatus, getProgressPercentage } from '@/types/kpis';

export const KPITracking = () => {
  const {
    kpis,
    stats,
    loading,
    error,
    createKPI,
    refetch,
    creating
  } = useKPIs();

  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [formData, setFormData] = useState<KPIFormData>({
    name: '',
    description: '',
    current_value: 0,
    target_value: 0,
    unit: '',
    frequency: 'monthly'
  });

  const handleSubmit = async () => {
    await createKPI(formData);
    setFormData({
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      frequency: 'monthly'
    });
    setIsAddingKPI(false);
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

  return (
    <BaseMBPTab
      title="KPI Tracking & Goals"
      description="Monitor key performance indicators and track progress towards your goals"
      loading={loading}
      error={error}
      isEmpty={kpis.length === 0}
      emptyStateTitle="No KPIs Defined"
      emptyStateDescription="Start tracking your key performance indicators by creating your first KPI."
      onRefresh={refetch}
      onAdd={() => setIsAddingKPI(true)}
      addButtonLabel="Add KPI"
    >
      <div className="space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">On Track</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.onTrack}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.atRisk}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Behind</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {stats.behind}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Total KPIs</span>
              </div>
              <div className="text-2xl font-bold">
                {stats.total}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kpis.map((kpi) => {
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
                        <span>Current: {kpi.current_value.toLocaleString()}{kpi.unit || ''}</span>
                        <span>Target: {kpi.target_value.toLocaleString()}{kpi.unit || ''}</span>
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
      </div>

      <FormDialog
        open={isAddingKPI}
        onOpenChange={setIsAddingKPI}
        title="Add New KPI"
        description="Create a new key performance indicator to track"
        onSubmit={handleSubmit}
        submitLabel="Add KPI"
        loading={creating}
        submitDisabled={!formData.name || !formData.target_value}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">KPI Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monthly Revenue"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this KPI measures..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Unit</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="$, %, units"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </FormDialog>
    </BaseMBPTab>
  );
};