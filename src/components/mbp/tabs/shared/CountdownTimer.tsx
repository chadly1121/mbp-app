import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO, isPast, differenceInDays } from 'date-fns';

interface CountdownTimerProps {
  targetDate: string | null;
  className?: string;
}

export const CountdownTimer = ({ targetDate, className = '' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'safe' | 'warning' | 'critical' | 'overdue'>('safe');

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft('No due date set');
      return;
    }

    const updateCountdown = () => {
      try {
        const target = parseISO(targetDate);
        const now = new Date();
        
        if (isPast(target)) {
          setIsOverdue(true);
          setUrgencyLevel('overdue');
          setTimeLeft(`Overdue by ${formatDistanceToNow(target)}`);
          return;
        }

        const daysLeft = differenceInDays(target, now);
        
        // Set urgency level based on days remaining
        if (daysLeft <= 3) {
          setUrgencyLevel('critical');
        } else if (daysLeft <= 7) {
          setUrgencyLevel('warning');
        } else {
          setUrgencyLevel('safe');
        }

        setIsOverdue(false);
        setTimeLeft(`Due in ${formatDistanceToNow(target)}`);
      } catch (error) {
        setTimeLeft('Invalid date');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <Badge variant="outline" className={`${className} text-muted-foreground`}>
        <Clock className="h-3 w-3 mr-1" />
        No due date
      </Badge>
    );
  }

  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'safe':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getIcon = () => {
    if (urgencyLevel === 'overdue') {
      return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
    if (urgencyLevel === 'critical') {
      return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
    if (urgencyLevel === 'safe') {
      return <CheckCircle className="h-3 w-3 mr-1" />;
    }
    return <Clock className="h-3 w-3 mr-1" />;
  };

  return (
    <Badge 
      className={`${className} ${getUrgencyStyles()} font-medium`}
      variant="outline"
    >
      {getIcon()}
      {timeLeft}
    </Badge>
  );
};