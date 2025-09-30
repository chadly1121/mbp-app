import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, CheckSquare, Clock, AlertTriangle, Plus, DollarSign, TrendingDown, Edit, Trash2, Calendar } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormDialog } from '@/components/mbp/tabs/shared/FormDialog';
import { useKPIs } from '@/hooks/useKPIs';
import { useNavigate } from 'react-router-dom';

interface Goal {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  frequency: string;
}

interface Objective {
  id: string;
  title: string;
  status: string;
  priority: string;
  target_date: string;
}

interface FinancialMetric {
  revenue: number;
  expenses: number;
  grossProfit: number;
  grossMargin: number;
}

export const GSRDashboard = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const { updateKPI, updating, createKPI, creating } = useKPIs();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric>({
    revenue: 0,
    expenses: 0,
    grossProfit: 0,
    grossMargin: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isSchedulingReview, setIsSchedulingReview] = useState(false);
  const [selectedGoalForUpdate, setSelectedGoalForUpdate] = useState<Goal | null>(null);
  const [goalFormData, setGoalFormData] = useState({
    name: '',
    description: '',
    current_value: 0,
    target_value: 0,
    unit: '',
    frequency: 'monthly'
  });
  const [reviewScheduleData, setReviewScheduleData] = useState({
    review_date: '',
    review_type: 'weekly',
    notes: ''
  });

  useEffect(() => {
    if (currentCompany) {
      fetchData();
    }
  }, [currentCompany]);

  const fetchData = async () => {
    if (!currentCompany) return;

    try {
      // Fetch KPIs as goals
      const { data: kpis, error: kpiError } = await supabase
        .from('kpis')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true);

      // Fetch strategic objectives
      const { data: strategicObjectives, error: objectiveError } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('company_id', currentCompany.id);

      // Fetch real financial data from QBO
      const currentYear = new Date().getFullYear();
      const { data: plData, error: plError } = await supabase
        .from('qbo_profit_loss')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('fiscal_year', currentYear);

      if (kpiError) throw kpiError;
      if (objectiveError) throw objectiveError;
      if (plError) throw plError;

      setGoals(kpis || []);
      setObjectives(strategicObjectives || []);

      // Calculate real financial metrics from QBO data
      if (plData && plData.length > 0) {
        const revenue = plData
          .filter(item => item.account_type === 'revenue')
          .reduce((sum, item) => sum + (item.year_to_date || 0), 0);
        
        const expenses = plData
          .filter(item => item.account_type === 'expense')
          .reduce((sum, item) => sum + (item.year_to_date || 0), 0);
        
        const cogs = plData
          .filter(item => item.account_type === 'cost_of_goods_sold')
          .reduce((sum, item) => sum + (item.year_to_date || 0), 0);
        
        const grossProfit = revenue - cogs;
        const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

        setFinancialMetrics({
          revenue,
          expenses: expenses + cogs,
          grossProfit,
          grossMargin
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getGoalStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return { status: 'achieved', color: 'text-green-600 bg-green-50' };
    if (percentage >= 75) return { status: 'on-track', color: 'text-blue-600 bg-blue-50' };
    if (percentage >= 50) return { status: 'at-risk', color: 'text-yellow-600 bg-yellow-50' };
    return { status: 'behind', color: 'text-red-600 bg-red-50' };
  };

  const getObjectiveStatus = (status: string, targetDate: string) => {
    const isOverdue = new Date(targetDate) < new Date() && status !== 'completed';
    if (status === 'completed') return { label: 'Completed', color: 'text-green-600 bg-green-50' };
    if (isOverdue) return { label: 'Overdue', color: 'text-red-600 bg-red-50' };
    if (status === 'in_progress') return { label: 'In Progress', color: 'text-blue-600 bg-blue-50' };
    return { label: 'Not Started', color: 'text-gray-600 bg-gray-50' };
  };

  const handleCreateGoal = async () => {
    await createKPI({
      ...goalFormData,
      frequency: goalFormData.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    });
    setGoalFormData({
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      frequency: 'monthly'
    });
    setIsAddingGoal(false);
    fetchData(); // Refresh the data
  };

  const handleEditGoal = (goal: Goal) => {
    setGoalFormData({
      name: goal.name,
      description: '', // Goals from KPIs don't have description in the interface, but we can add it
      current_value: goal.current_value,
      target_value: goal.target_value,
      unit: goal.unit,
      frequency: goal.frequency
    });
    setEditingGoalId(goal.id);
    setIsEditingGoal(true);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoalId) return;
    
    await updateKPI({
      id: editingGoalId,
      data: {
        ...goalFormData,
        frequency: goalFormData.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
      }
    });
    setGoalFormData({
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      frequency: 'monthly'
    });
    setIsEditingGoal(false);
    setEditingGoalId(null);
    fetchData(); // Refresh the data
  };

  const handleCancelEdit = () => {
    setGoalFormData({
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      frequency: 'monthly'
    });
    setIsEditingGoal(false);
    setEditingGoalId(null);
  };

  const handleUpdateProgress = (goal?: Goal) => {
    if (goal) {
      setSelectedGoalForUpdate(goal);
      setGoalFormData({
        name: goal.name,
        description: '',
        current_value: goal.current_value,
        target_value: goal.target_value,
        unit: goal.unit,
        frequency: goal.frequency
      });
    }
    setIsUpdatingProgress(true);
  };

  const handleProgressUpdate = async () => {
    if (!selectedGoalForUpdate) return;
    
    await updateKPI({
      id: selectedGoalForUpdate.id,
      data: {
        current_value: goalFormData.current_value
      }
    });
    
    setIsUpdatingProgress(false);
    setSelectedGoalForUpdate(null);
    setGoalFormData({
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      frequency: 'monthly'
    });
    fetchData();
    toast({
      title: "Progress Updated",
      description: "Goal progress has been successfully updated.",
    });
  };

  const handleReviewObjectives = () => {
    // Navigate to Strategic Planning page
    navigate('/mbp-dashboard?tab=strategic-planning');
  };

  const handleScheduleReview = async () => {
    if (!currentCompany || !reviewScheduleData.review_date) return;

    try {
      // Create a review reminder/action item
      const { error } = await supabase
        .from('action_items')
        .insert({
          company_id: currentCompany.id,
          title: `${reviewScheduleData.review_type.charAt(0).toUpperCase() + reviewScheduleData.review_type.slice(1)} GSR Review`,
          description: reviewScheduleData.notes || `Scheduled ${reviewScheduleData.review_type} review of goals and objectives`,
          category: 'Review',
          due_date: reviewScheduleData.review_date,
          priority: 'medium',
          status: 'pending'
        });

      if (error) throw error;

      setIsSchedulingReview(false);
      setReviewScheduleData({
        review_date: '',
        review_type: 'weekly',
        notes: ''
      });
      
      toast({
        title: "Review Scheduled",
        description: "Your review has been scheduled and added to action items.",
      });
    } catch (error: any) {
      toast({
        title: "Error scheduling review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading GSR Dashboard...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  const totalGoals = goals.length;
  const achievedGoals = goals.filter(g => getProgressPercentage(g.current_value, g.target_value) >= 100).length;
  const onTrackGoals = goals.filter(g => {
    const progress = getProgressPercentage(g.current_value, g.target_value);
    return progress >= 75 && progress < 100;
  }).length;
  
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(o => o.status === 'completed').length;
  const inProgressObjectives = objectives.filter(o => o.status === 'in_progress').length;
  
  const overallProgress = totalGoals > 0 
    ? (achievedGoals + (onTrackGoals * 0.75)) / totalGoals * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Goal Setting & Review Dashboard</h1>
          <p className="text-muted-foreground">
            Track your goals, review progress, and maintain strategic alignment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSchedulingReview(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button size="sm" onClick={() => setIsAddingGoal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Set New Goal
          </Button>
        </div>
      </div>

      {/* Financial Performance from QBO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Revenue (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${financialMetrics.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From QuickBooks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${financialMetrics.expenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">COGS + Operating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${financialMetrics.grossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Revenue - COGS</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {financialMetrics.grossMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Profit / Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Performance
          </CardTitle>
          <CardDescription>
            Your progress across all goals and strategic objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Goal Achievement</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{achievedGoals}</div>
                <div className="text-xs text-muted-foreground">Goals Achieved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{onTrackGoals}</div>
                <div className="text-xs text-muted-foreground">On Track</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedObjectives}</div>
                <div className="text-xs text-muted-foreground">Objectives Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{inProgressObjectives}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Goal Progress
            </CardTitle>
            <CardDescription>
              Track progress on your key performance goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No goals set yet</p>
                </div>
              ) : (
                goals.map((goal) => {
                  const progress = getProgressPercentage(goal.current_value, goal.target_value);
                  const status = getGoalStatus(goal.current_value, goal.target_value);
                  
                  return (
                    <div key={goal.id} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{goal.name}</h4>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateProgress(goal)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                title="Update progress"
                              >
                                <TrendingUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleEditGoal(goal)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                title="Edit goal"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {goal.current_value.toLocaleString()}{goal.unit} / {goal.target_value.toLocaleString()}{goal.unit}
                          </p>
                        </div>
                        <Badge className={status.color}>
                          {status.status}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {progress.toFixed(1)}% complete
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Strategic Objectives
            </CardTitle>
            <CardDescription>
              Review your strategic initiatives and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {objectives.length === 0 ? (
                <div className="text-center py-6">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No objectives defined yet</p>
                </div>
              ) : (
                objectives.slice(0, 5).map((objective) => {
                  const status = getObjectiveStatus(objective.status, objective.target_date);
                  const isHighPriority = objective.priority === 'high' || objective.priority === 'critical';
                  
                  return (
                    <div key={objective.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{objective.title}</h4>
                          {isHighPriority && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(objective.target_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                  );
                })
              )}
              {objectives.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View all {objectives.length} objectives
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for goal setting and review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => setIsAddingGoal(true)}>
              <Target className="h-6 w-6" />
              <span className="text-xs text-center">Set New Goal</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => handleUpdateProgress()}>
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs text-center">Update Progress</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={handleReviewObjectives}>
              <CheckSquare className="h-6 w-6" />
              <span className="text-xs text-center">Review Objectives</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => setIsSchedulingReview(true)}>
              <Clock className="h-6 w-6" />
              <span className="text-xs text-center">Schedule Review</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <FormDialog
        open={isAddingGoal}
        onOpenChange={setIsAddingGoal}
        title="Set New Goal"
        description="Create a new goal to track your progress"
        onSubmit={handleCreateGoal}
        submitLabel="Create Goal"
        loading={creating}
        submitDisabled={!goalFormData.name || !goalFormData.target_value}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Goal Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={goalFormData.name}
              onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
              placeholder="e.g., Monthly Revenue"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={goalFormData.description}
              onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
              placeholder="Describe what this goal measures..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.current_value}
                onChange={(e) => setGoalFormData({ ...goalFormData, current_value: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.target_value}
                onChange={(e) => setGoalFormData({ ...goalFormData, target_value: Number(e.target.value) })}
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
                value={goalFormData.unit}
                onChange={(e) => setGoalFormData({ ...goalFormData, unit: e.target.value })}
                placeholder="$, %, units"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.frequency}
                onChange={(e) => setGoalFormData({ ...goalFormData, frequency: e.target.value })}
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

      {/* Edit Goal Dialog */}
      <FormDialog
        open={isEditingGoal}
        onOpenChange={(open) => {
          if (!open) handleCancelEdit();
        }}
        title="Edit Goal"
        description="Update your goal settings and progress"
        onSubmit={handleUpdateGoal}
        submitLabel="Update Goal"
        loading={updating}
        submitDisabled={!goalFormData.name || !goalFormData.target_value}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Goal Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={goalFormData.name}
              onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
              placeholder="e.g., Monthly Revenue"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={goalFormData.description}
              onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
              placeholder="Describe what this goal measures..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.current_value}
                onChange={(e) => setGoalFormData({ ...goalFormData, current_value: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.target_value}
                onChange={(e) => setGoalFormData({ ...goalFormData, target_value: Number(e.target.value) })}
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
                value={goalFormData.unit}
                onChange={(e) => setGoalFormData({ ...goalFormData, unit: e.target.value })}
                placeholder="$, %, units"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.frequency}
                onChange={(e) => setGoalFormData({ ...goalFormData, frequency: e.target.value })}
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

      {/* Update Progress Dialog */}
      <FormDialog
        open={isUpdatingProgress}
        onOpenChange={(open) => {
          if (!open) {
            setIsUpdatingProgress(false);
            setSelectedGoalForUpdate(null);
          }
        }}
        title="Update Progress"
        description={selectedGoalForUpdate ? `Update current progress for ${selectedGoalForUpdate.name}` : "Update goal progress"}
        onSubmit={handleProgressUpdate}
        submitLabel="Update Progress"
        loading={updating}
        submitDisabled={!selectedGoalForUpdate}
      >
        {selectedGoalForUpdate && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-1">{selectedGoalForUpdate.name}</h4>
              <p className="text-xs text-muted-foreground">
                Target: {selectedGoalForUpdate.target_value.toLocaleString()}{selectedGoalForUpdate.unit}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                value={goalFormData.current_value}
                onChange={(e) => setGoalFormData({ ...goalFormData, current_value: Number(e.target.value) })}
                placeholder="Enter current progress"
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              Progress: {selectedGoalForUpdate.target_value > 0 
                ? Math.min((goalFormData.current_value / selectedGoalForUpdate.target_value) * 100, 100).toFixed(1)
                : 0}%
            </div>
          </div>
        )}
        
        {!selectedGoalForUpdate && goals.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select a goal to update:</p>
            {goals.map((goal) => (
              <Button
                key={goal.id}
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleUpdateProgress(goal)}
              >
                <div>
                  <div className="font-medium text-sm">{goal.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {goal.current_value.toLocaleString()}{goal.unit} / {goal.target_value.toLocaleString()}{goal.unit}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
        
        {goals.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p>No goals available to update</p>
          </div>
        )}
      </FormDialog>

      {/* Schedule Review Dialog */}
      <FormDialog
        open={isSchedulingReview}
        onOpenChange={(open) => {
          if (!open) {
            setIsSchedulingReview(false);
            setReviewScheduleData({
              review_date: '',
              review_type: 'weekly',
              notes: ''
            });
          }
        }}
        title="Schedule Review"
        description="Schedule a regular review of your goals and objectives"
        onSubmit={handleScheduleReview}
        submitLabel="Schedule Review"
        loading={false}
        submitDisabled={!reviewScheduleData.review_date}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Review Date</label>
            <input
              type="date"
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={reviewScheduleData.review_date}
              onChange={(e) => setReviewScheduleData({ ...reviewScheduleData, review_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Review Type</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={reviewScheduleData.review_type}
              onChange={(e) => setReviewScheduleData({ ...reviewScheduleData, review_type: e.target.value })}
            >
              <option value="weekly">Weekly Review</option>
              <option value="monthly">Monthly Review</option>
              <option value="quarterly">Quarterly Review</option>
              <option value="annual">Annual Review</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              value={reviewScheduleData.notes}
              onChange={(e) => setReviewScheduleData({ ...reviewScheduleData, notes: e.target.value })}
              placeholder="Add any specific focus areas or notes for this review..."
              rows={3}
            />
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Review Details</span>
            </div>
            <p className="text-blue-700">
              This will create an action item to remind you of your scheduled review on {reviewScheduleData.review_date || '[select date]'}.
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};