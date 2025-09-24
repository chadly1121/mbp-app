import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle } from 'lucide-react';

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

export const MonthlyReview = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedYear, setSelectedYear] = useState('2024');

  // Mock data for monthly review
  const monthlyMetrics: MonthlyMetric[] = [
    {
      name: 'Revenue',
      actual: 125000,
      target: 120000,
      previousMonth: 118000,
      unit: '$',
      category: 'Financial'
    },
    {
      name: 'New Customers',
      actual: 45,
      target: 50,
      previousMonth: 42,
      unit: '',
      category: 'Growth'
    },
    {
      name: 'Customer Churn Rate',
      actual: 3.2,
      target: 2.5,
      previousMonth: 3.8,
      unit: '%',
      category: 'Retention'
    },
    {
      name: 'Operating Margin',
      actual: 22.5,
      target: 25.0,
      previousMonth: 21.8,
      unit: '%',
      category: 'Financial'
    },
    {
      name: 'Team Productivity',
      actual: 87,
      target: 85,
      previousMonth: 84,
      unit: '%',
      category: 'Operations'
    }
  ];

  const highlights: MonthlyHighlight[] = [
    {
      type: 'success',
      title: 'Revenue Target Exceeded',
      description: 'Monthly revenue exceeded target by $5,000 (4.2% above target)'
    },
    {
      type: 'warning',
      title: 'Customer Acquisition Below Target',
      description: 'New customer acquisition was 10% below target. Marketing campaigns need optimization.'
    },
    {
      type: 'success',
      title: 'Churn Rate Improvement',
      description: 'Customer churn rate improved by 0.6% compared to previous month'
    },
    {
      type: 'info',
      title: 'New Product Launch',
      description: 'Successfully launched premium tier with positive initial feedback'
    }
  ];

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

  const overallScore = Math.round(
    monthlyMetrics.reduce((sum, metric) => {
      const isLowerBetter = metric.name.toLowerCase().includes('churn');
      const status = getMetricStatus(metric.actual, metric.target, isLowerBetter);
      const score = status === 'excellent' ? 100 : status === 'good' ? 85 : status === 'warning' ? 70 : 50;
      return sum + score;
    }, 0) / monthlyMetrics.length
  );

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
          <Select value={`${selectedYear}-${selectedMonth.split('-')[1]}`} onValueChange={(value) => {
            const [year, month] = value.split('-');
            setSelectedYear(year);
            setSelectedMonth(value);
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
            </SelectContent>
          </Select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Monthly Score */}
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

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
          <CardDescription>
            Actual vs target performance for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyMetrics.map((metric, index) => {
              const isLowerBetter = metric.name.toLowerCase().includes('churn');
              const status = getMetricStatus(metric.actual, metric.target, isLowerBetter);
              const trend = calculateTrend(metric.actual, metric.previousMonth);
              const TrendIcon = trend.direction === 'up' ? TrendingUp : TrendingDown;

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
                  
                  <div className="grid grid-cols-3 gap-6 text-right">
                    <div>
                      <div className="text-sm text-muted-foreground">Actual</div>
                      <div className="text-lg font-semibold">
                        {metric.unit}{metric.actual.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Target</div>
                      <div className="text-lg">
                        {metric.unit}{metric.target.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">vs Previous</div>
                      <div className={`text-lg font-medium flex items-center gap-1 justify-end ${
                        trend.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="h-4 w-4" />
                        {trend.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Highlights
          </CardTitle>
          <CardDescription>
            Key achievements, challenges, and insights from this month
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

      {/* Action Items for Next Month */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Areas for Next Month</CardTitle>
          <CardDescription>
            Key priorities and action items based on this month's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Improve Customer Acquisition</div>
                <div className="text-sm text-blue-700">
                  Launch new marketing campaigns and optimize conversion funnel to reach next month's target
                </div>   
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Monitor Operating Expenses</div>
                <div className="text-sm text-yellow-700">
                  Review cost structure to improve operating margin and reach 25% target
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Capitalize on Revenue Momentum</div>
                <div className="text-sm text-green-700">
                  Continue successful strategies that led to revenue target achievement
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};