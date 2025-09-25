import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonthlyMetric {
  name: string;
  actual: number;
  target: number;
  previousMonth: number;
  unit: string;
  category: string;
}

interface MonthlyHighlight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

interface MonthlyReviewData {
  id: string;
  review_month: number;
  review_year: number;
  revenue_actual: number;
  revenue_target: number;
  expenses_actual: number;
  expenses_target: number;
  key_achievements?: string;
  challenges_faced?: string;
  lessons_learned?: string;
  next_month_focus?: string;
}

export const MonthlyReview = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reviewData, setReviewData] = useState<MonthlyReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    revenue_actual: 0,
    revenue_target: 0,
    expenses_actual: 0,
    expenses_target: 0,
    key_achievements: '',
    challenges_faced: '',
    lessons_learned: '',
    next_month_focus: ''
  });

  useEffect(() => {
    if (currentCompany) {
      fetchMonthlyReview();
    }
  }, [currentCompany, selectedMonth, selectedYear]);

  const fetchMonthlyReview = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('monthly_reviews')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('review_month', selectedMonth)
        .eq('review_year', selectedYear)
        .maybeSingle();

      if (error) throw error;
      setReviewData(data);
      
      if (data) {
        setEditData({
          revenue_actual: data.revenue_actual || 0,
          revenue_target: data.revenue_target || 0,
          expenses_actual: data.expenses_actual || 0,
          expenses_target: data.expenses_target || 0,
          key_achievements: data.key_achievements || '',
          challenges_faced: data.challenges_faced || '',
          lessons_learned: data.lessons_learned || '',
          next_month_focus: data.next_month_focus || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading monthly review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMonthlyReview = async () => {
    if (!currentCompany) return;

    try {
      const reviewRecord = {
        company_id: currentCompany.id,
        review_month: selectedMonth,
        review_year: selectedYear,
        ...editData
      };

      if (reviewData) {
        // Update existing record
        const { error } = await supabase
          .from('monthly_reviews')
          .update(reviewRecord)
          .eq('id', reviewData.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('monthly_reviews')
          .insert([reviewRecord]);
        
        if (error) throw error;
      }

      toast({
        title: "Monthly review saved",
        description: `Review for ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been saved.`,
      });

      setIsEditing(false);
      fetchMonthlyReview();
    } catch (error: any) {
      toast({
        title: "Error saving monthly review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate metrics from review data and real financial data
  const monthlyMetrics: MonthlyMetric[] = reviewData ? [
    {
      name: 'Revenue',
      actual: reviewData.revenue_actual || 0,
      target: reviewData.revenue_target || 0,
      previousMonth: reviewData.revenue_actual || 0, // Could fetch previous month's data
      unit: '$',
      category: 'Financial'
    },
    {
      name: 'Expenses',
      actual: reviewData.expenses_actual || 0,
      target: reviewData.expenses_target || 0,
      previousMonth: reviewData.expenses_actual || 0,
      unit: '$',
      category: 'Financial'
    },
    {
      name: 'Profit Margin',
      actual: reviewData.revenue_actual > 0 
        ? ((reviewData.revenue_actual - reviewData.expenses_actual) / reviewData.revenue_actual) * 100 
        : 0,
      target: reviewData.revenue_target > 0 
        ? ((reviewData.revenue_target - reviewData.expenses_target) / reviewData.revenue_target) * 100 
        : 25,
      previousMonth: 20, // Could calculate from previous month
      unit: '%',
      category: 'Financial'
    }
  ] : [];

  const highlights: MonthlyHighlight[] = [];
  
  if (reviewData) {
    // Generate highlights based on actual data
    if (reviewData.revenue_actual > reviewData.revenue_target) {
      highlights.push({
        type: 'success',
        title: 'Revenue Target Exceeded',
        description: `Monthly revenue exceeded target by $${(reviewData.revenue_actual - reviewData.revenue_target).toLocaleString()}`
      });
    } else if (reviewData.revenue_actual < reviewData.revenue_target * 0.9) {
      highlights.push({
        type: 'warning',
        title: 'Revenue Below Target',
        description: `Revenue was ${(((reviewData.revenue_target - reviewData.revenue_actual) / reviewData.revenue_target) * 100).toFixed(1)}% below target`
      });
    }

    if (reviewData.expenses_actual > reviewData.expenses_target) {
      highlights.push({
        type: 'warning',
        title: 'Expenses Over Budget',
        description: `Expenses exceeded budget by $${(reviewData.expenses_actual - reviewData.expenses_target).toLocaleString()}`
      });
    }

    if (reviewData.key_achievements) {
      highlights.push({
        type: 'success',
        title: 'Key Achievements',
        description: reviewData.key_achievements.slice(0, 100) + (reviewData.key_achievements.length > 100 ? '...' : '')
      });
    }
  }

  const getMetricStatus = (actual: number, target: number, isLowerBetter = false) => {
    const percentage = (actual / target) * 100;
    if (isLowerBetter) {
      if (percentage <= 80) return 'excellent';
      if (percentage <= 100) return 'good';
      if (percentage <= 120) return 'warning';
      return 'poor';
    } else {
      if (percentage >= 110) return 'excellent';
      if (percentage >= 100) return 'good';
      if (percentage >= 90) return 'warning';
      return 'poor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      default: return Target;
    }
  };

  const getHighlightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : 'down',
      isPositive: change > 0
    };
  };

  const overallScore = monthlyMetrics.length > 0 ? Math.round(
    monthlyMetrics.reduce((sum, metric) => {
      const isLowerBetter = metric.name.toLowerCase().includes('expense');
      const status = getMetricStatus(metric.actual, metric.target, isLowerBetter);
      const score = status === 'excellent' ? 100 : status === 'good' ? 85 : status === 'warning' ? 70 : 50;
      return sum + score;
    }, 0) / monthlyMetrics.length
  ) : 0;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading monthly review...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Monthly Business Review</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive review of monthly performance and key metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`} onValueChange={(value) => {
            const [year, month] = value.split('-');
            setSelectedYear(parseInt(year));
            setSelectedMonth(parseInt(month));
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2024-02">February 2024</SelectItem>
              <SelectItem value="2024-03">March 2024</SelectItem>
              <SelectItem value="2024-04">April 2024</SelectItem>
              <SelectItem value="2024-05">May 2024</SelectItem>
              <SelectItem value="2024-06">June 2024</SelectItem>
              <SelectItem value="2024-07">July 2024</SelectItem>
              <SelectItem value="2024-08">August 2024</SelectItem>
              <SelectItem value="2024-09">September 2024</SelectItem>
              <SelectItem value="2024-10">October 2024</SelectItem>
              <SelectItem value="2024-11">November 2024</SelectItem>
              <SelectItem value="2024-12">December 2024</SelectItem>
              <SelectItem value="2025-01">January 2025</SelectItem>
              <SelectItem value="2025-02">February 2025</SelectItem>
              <SelectItem value="2025-03">March 2025</SelectItem>
              <SelectItem value="2025-04">April 2025</SelectItem>
              <SelectItem value="2025-05">May 2025</SelectItem>
              <SelectItem value="2025-06">June 2025</SelectItem>
            </SelectContent>
          </Select>
          {!reviewData && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Button>
          )}
          {reviewData && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Review
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={saveMonthlyReview}>Save</Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Score */}
      {monthlyMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Monthly Score
            </CardTitle>
            <CardDescription>
              Composite score based on all key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-4xl font-bold text-primary">{overallScore}</div>
              <div className="flex-1">
                <Progress value={overallScore} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor (0-60)</span>
                  <span>Good (60-85)</span>
                  <span>Excellent (85-100)</span>
                </div>
              </div>
              <Badge variant="outline" className={
                overallScore >= 85 ? 'text-green-600 bg-green-50 border-green-200' :
                overallScore >= 70 ? 'text-blue-600 bg-blue-50 border-blue-200' :
                overallScore >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                'text-red-600 bg-red-50 border-red-200'
              }>
                {overallScore >= 85 ? 'Excellent' :
                 overallScore >= 70 ? 'Good' :
                 overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form or Metrics */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Review Data</CardTitle>
            <CardDescription>
              Enter financial data and insights for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Actual Revenue</Label>
                <Input
                  type="number"
                  value={editData.revenue_actual}
                  onChange={(e) => setEditData({...editData, revenue_actual: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Target Revenue</Label>
                <Input
                  type="number"
                  value={editData.revenue_target}
                  onChange={(e) => setEditData({...editData, revenue_target: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Actual Expenses</Label>
                <Input
                  type="number"
                  value={editData.expenses_actual}
                  onChange={(e) => setEditData({...editData, expenses_actual: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Target Expenses</Label>
                <Input
                  type="number"
                  value={editData.expenses_target}
                  onChange={(e) => setEditData({...editData, expenses_target: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Key Achievements</Label>
              <Textarea
                value={editData.key_achievements}
                onChange={(e) => setEditData({...editData, key_achievements: e.target.value})}
                placeholder="What were the major wins this month?"
              />
            </div>
            <div>
              <Label>Challenges Faced</Label>
              <Textarea
                value={editData.challenges_faced}
                onChange={(e) => setEditData({...editData, challenges_faced: e.target.value})}
                placeholder="What obstacles did you encounter?"
              />
            </div>
            <div>
              <Label>Lessons Learned</Label>
              <Textarea
                value={editData.lessons_learned}
                onChange={(e) => setEditData({...editData, lessons_learned: e.target.value})}
                placeholder="What insights did you gain?"
              />
            </div>
            <div>
              <Label>Next Month Focus</Label>
              <Textarea
                value={editData.next_month_focus}
                onChange={(e) => setEditData({...editData, next_month_focus: e.target.value})}
                placeholder="What are the priorities for next month?"
              />
            </div>
          </CardContent>
        </Card>
      ) : monthlyMetrics.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Metrics</CardTitle>
            <CardDescription>
              Performance summary for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyMetrics.map((metric, index) => {
                const isLowerBetter = metric.name.toLowerCase().includes('expense');
                const status = getMetricStatus(metric.actual, metric.target, isLowerBetter);

                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{metric.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                          {status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{metric.category}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">Actual</div>
                        <div className="text-lg font-semibold">
                          {metric.unit === '$' ? '$' : ''}{metric.actual.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Target</div>
                        <div className="text-lg">
                          {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Review Data</h4>
          <p className="text-muted-foreground mb-4">Create a monthly review to track performance and insights.</p>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Monthly Review
          </Button>
        </Card>
      )}

      {/* Monthly Highlights and Review Text */}
      {reviewData && !isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {highlights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Highlights
                </CardTitle>
                <CardDescription>
                  Key achievements and challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highlights.map((highlight, index) => {
                    const Icon = getHighlightIcon(highlight.type);
                    return (
                      <div key={index} className={`flex gap-3 p-4 rounded-lg border ${getHighlightColor(highlight.type)}`}>
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">{highlight.title}</h4>
                          <p className="text-sm mt-1">{highlight.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Review Insights</CardTitle>
              <CardDescription>
                Detailed observations and next steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewData.challenges_faced && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Challenges Faced</h5>
                  <p className="text-sm text-muted-foreground">{reviewData.challenges_faced}</p>
                </div>
              )}
              {reviewData.lessons_learned && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Lessons Learned</h5>
                  <p className="text-sm text-muted-foreground">{reviewData.lessons_learned}</p>
                </div>
              )}
              {reviewData.next_month_focus && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Next Month Focus</h5>
                  <p className="text-sm text-muted-foreground">{reviewData.next_month_focus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};