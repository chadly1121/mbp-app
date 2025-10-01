import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Minus, RefreshCw } from 'lucide-react';
import { FormDialog } from '@/components/mbp/tabs/shared/FormDialog';
import { useKPIs } from '@/hooks/useKPIs';
import { KPIFormData, getKPIStatus, getProgressPercentage, QBO_METRIC_LABELS, QBOMetricType } from '@/types/kpis';

export const KPITrackingPage = () => {
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
    frequency: 'monthly',
    data_source: 'manual',
    auto_sync: false
  });

  const handleSubmit = async () => {
    await createKPI(formData);
    setFormData({
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      frequency: 'monthly',
      data_source: 'manual',
      auto_sync: false
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        Loading KPIs...
      </div>
    );
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddingKPI(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add KPI
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">On Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Behind</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.behind}</div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Grid */}
      {kpis.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KPIs Defined</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking your key performance indicators by creating your first KPI.
            </p>
            <Button onClick={() => setIsAddingKPI(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First KPI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => {
            const progress = getProgressPercentage(kpi.current_value, kpi.target_value);
            const statusColor = getStatusColor(kpi.current_value, kpi.target_value);
            const StatusIcon = getStatusIcon(kpi.current_value, kpi.target_value);
            const TrendIcon = getTrendIcon(kpi.current_value, kpi.target_value);
            
            return (
              <Card key={kpi.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{kpi.name}</CardTitle>
                      {kpi.description && (
                        <CardDescription className="mt-1">
                          {kpi.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <TrendIcon className="h-4 w-4 text-muted-foreground" />
                      <StatusIcon className={`h-4 w-4 ${statusColor.split(' ')[0]}`} />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {kpi.current_value.toLocaleString()}{kpi.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {kpi.target_value.toLocaleString()}{kpi.unit} target
                      </div>
                    </div>
                    <Badge className={statusColor}>
                      {getKPIStatus(kpi.current_value, kpi.target_value)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Frequency: {kpi.frequency}</span>
                    {kpi.data_source === 'qbo' && (
                      <Badge variant="outline" className="text-xs">
                        QBO Synced
                      </Badge>
                    )}
                  </div>
                  {kpi.last_synced_at && (
                    <div className="text-xs text-muted-foreground">
                      Last synced: {new Date(kpi.last_synced_at).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add KPI Dialog */}
      <FormDialog
        open={isAddingKPI}
        onOpenChange={setIsAddingKPI}
        title="Add New KPI"
        description="Create a new key performance indicator to track your progress"
        onSubmit={handleSubmit}
        submitLabel="Create KPI"
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
              placeholder="e.g., Monthly Revenue, Customer Retention Rate"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this KPI measure?"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Data Source</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={formData.data_source}
              onChange={(e) => setFormData({ 
                ...formData, 
                data_source: e.target.value as 'manual' | 'qbo',
                qbo_metric_type: e.target.value === 'manual' ? undefined : formData.qbo_metric_type
              })}
            >
              <option value="manual">Manual Entry</option>
              <option value="qbo">QuickBooks Online</option>
            </select>
          </div>

          {formData.data_source === 'qbo' && (
            <>
              <div>
                <label className="text-sm font-medium">QBO Metric Type</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                  value={formData.qbo_metric_type || ''}
                  onChange={(e) => setFormData({ ...formData, qbo_metric_type: e.target.value as QBOMetricType })}
                >
                  <option value="">Select a metric...</option>
                  {Object.entries(QBO_METRIC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_sync"
                  checked={formData.auto_sync || false}
                  onChange={(e) => setFormData({ ...formData, auto_sync: e.target.checked })}
                  className="rounded border-input"
                />
                <label htmlFor="auto_sync" className="text-sm font-medium cursor-pointer">
                  Auto-sync with QuickBooks Online
                </label>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                <strong>Note:</strong> When auto-sync is enabled, the current value will be automatically updated from QuickBooks whenever you sync your QBO data.
              </div>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Unit</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="$, %, units, etc."
                disabled={formData.data_source === 'qbo'}
              />
              {formData.data_source === 'qbo' && (
                <p className="text-xs text-muted-foreground mt-1">Unit will be set based on QBO metric type</p>
              )}
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
    </div>
  );
};