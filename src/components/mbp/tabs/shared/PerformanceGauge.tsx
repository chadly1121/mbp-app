import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { parseISO, isPast, differenceInDays } from 'date-fns';

interface PerformanceGaugeProps {
  objectives: any[];
  className?: string;
}

interface PerformanceMetrics {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  completedOnTime: number;
  completedLate: number;
  overdue: number;
  onTrack: number;
  total: number;
}

export const PerformanceGauge = ({ objectives, className = '' }: PerformanceGaugeProps) => {
  const metrics = useMemo((): PerformanceMetrics => {
    if (!objectives || objectives.length === 0) {
      return {
        score: 0,
        level: 'fair',
        completedOnTime: 0,
        completedLate: 0,
        overdue: 0,
        onTrack: 0,
        total: 0
      };
    }

    let completedOnTime = 0;
    let completedLate = 0;
    let overdue = 0;
    let onTrack = 0;

    objectives.forEach(objective => {
      const hasChecklist = objective.checklist && objective.checklist.length > 0;
      const completedItems = objective.checklist?.filter(item => item.is_completed).length || 0;
      const totalItems = objective.checklist?.length || 0;
      const isFullyCompleted = hasChecklist && completedItems === totalItems;
      
      if (!objective.target_date) {
        // No target date, neutral
        return;
      }

      try {
        const targetDate = parseISO(objective.target_date);
        const now = new Date();
        
        if (isFullyCompleted) {
          // Find the most recent completion time from checklist
          const latestCompletion = objective.checklist
            ?.filter(item => item.is_completed)
            .reduce((latest, item) => 
              !latest || new Date(item.updated_at) > new Date(latest) ? 
              item.updated_at : latest, null);
          
          if (latestCompletion) {
            const completedDate = parseISO(latestCompletion);
            if (completedDate <= targetDate) {
              completedOnTime++;
            } else {
              completedLate++;
            }
          }
        } else if (isPast(targetDate)) {
          // Overdue
          overdue++;
        } else {
          // Still has time
          const daysLeft = differenceInDays(targetDate, now);
          const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
          
          // Rough heuristic: if progress is on track for time remaining
          const expectedProgress = Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100));
          
          if (progressPercentage >= expectedProgress * 0.8) {
            onTrack++;
          } else {
            // Falling behind
            overdue++;
          }
        }
      } catch (error) {
        // Invalid date, skip
      }
    });

    const total = objectives.length;
    
    // Calculate score (0-100)
    let score = 0;
    if (total > 0) {
      score = Math.round(
        (completedOnTime * 100 + 
         completedLate * 70 + 
         onTrack * 60 - 
         overdue * 20) / total
      );
    }
    
    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 85) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'fair';
    else level = 'poor';

    return {
      score,
      level,
      completedOnTime,
      completedLate,
      overdue,
      onTrack,
      total
    };
  }, [objectives]);

  const getGaugeColor = () => {
    switch (metrics.level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLevelBadge = () => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      poor: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      excellent: <TrendingUp className="h-3 w-3" />,
      good: <TrendingUp className="h-3 w-3" />,
      fair: <Minus className="h-3 w-3" />,
      poor: <TrendingDown className="h-3 w-3" />
    };

    return (
      <Badge className={`${colors[metrics.level]} font-medium capitalize`} variant="outline">
        {icons[metrics.level]}
        <span className="ml-1">{metrics.level}</span>
      </Badge>
    );
  };

  // Calculate needle rotation (0-180 degrees for semicircle)
  const needleRotation = (metrics.score / 100) * 180;

  return (
    <Card className={`${className} bg-gradient-to-br from-slate-50 to-white`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Performance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Gauge Visualization */}
          <div className="relative">
            <div className="w-32 h-16 relative">
              {/* Gauge Background */}
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Colored segments */}
                <path
                  d="M 20 80 A 80 80 0 0 1 65 23"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 65 23 A 80 80 0 0 1 100 15"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 100 15 A 80 80 0 0 1 135 23"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 135 23 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Needle */}
                <g transform={`rotate(${needleRotation} 100 80)`}>
                  <line
                    x1="100"
                    y1="80"
                    x2="100"
                    y2="25"
                    stroke="#374151"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="80" r="4" fill="#374151" />
                </g>
              </svg>
            </div>
            
            {/* Score Display */}
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getGaugeColor()}`}>
                  {metrics.score}
                </div>
                <div className="text-xs text-muted-foreground">
                  Performance
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 ml-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">On Time:</span>
                <span className="font-semibold text-green-600">{metrics.completedOnTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">On Track:</span>
                <span className="font-semibold text-blue-600">{metrics.onTrack}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Late:</span>
                <span className="font-semibold text-yellow-600">{metrics.completedLate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">Overdue:</span>
                <span className="font-semibold text-red-600">{metrics.overdue}</span>
              </div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex flex-col items-end gap-2">
            {getLevelBadge()}
            <div className="text-xs text-muted-foreground">
              {metrics.total} objective{metrics.total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};