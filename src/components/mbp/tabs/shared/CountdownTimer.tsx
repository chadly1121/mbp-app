import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { parseISO, isPast, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface CountdownTimerProps {
  targetDate: string | null;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
}

export const CountdownTimer = ({ targetDate, className = '' }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'safe' | 'warning' | 'critical' | 'overdue'>('safe');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!targetDate) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      try {
        const target = parseISO(targetDate);
        const now = new Date();
        
        if (isPast(target)) {
          setIsOverdue(true);
          setUrgencyLevel('overdue');
          // Calculate overdue time
          const days = Math.abs(differenceInDays(now, target));
          const hours = Math.abs(differenceInHours(now, target)) % 24;
          const minutes = Math.abs(differenceInMinutes(now, target)) % 60;
          const seconds = Math.abs(differenceInSeconds(now, target)) % 60;
          setTimeRemaining({ days, hours, minutes, seconds, totalMinutes: Math.abs(differenceInMinutes(now, target)) });
          return;
        }

        // Calculate time remaining
        const days = differenceInDays(target, now);
        const hours = differenceInHours(target, now) % 24;
        const minutes = differenceInMinutes(target, now) % 60;
        const seconds = differenceInSeconds(target, now) % 60;
        const totalMinutes = differenceInMinutes(target, now);
        
        setTimeRemaining({ days, hours, minutes, seconds, totalMinutes });
        
        // Set urgency level based on time remaining
        if (totalMinutes <= 4320) { // 3 days
          setUrgencyLevel('critical');
        } else if (totalMinutes <= 10080) { // 7 days
          setUrgencyLevel('warning');
        } else {
          setUrgencyLevel('safe');
        }

        setIsOverdue(false);
      } catch (error) {
        setTimeRemaining(null);
      }
    };

    updateCountdown();
    const minuteInterval = setInterval(updateCountdown, 60000); // Update every minute
    
    // Pulse animation every second
    const pulseInterval = setInterval(() => {
      setPulse(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(minuteInterval);
      clearInterval(pulseInterval);
    };
  }, [targetDate]);

  if (!targetDate || !timeRemaining) {
    return (
      <Badge variant="outline" className={`${className} text-muted-foreground`}>
        <Clock className="h-3 w-3 mr-1" />
        No due date
      </Badge>
    );
  }

  const formatTimeDisplay = () => {
    if (!timeRemaining) return '';
    
    const { days, hours, minutes } = timeRemaining;
    const parts = [];
    
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    
    const prefix = isOverdue ? 'Overdue by ' : 'Due in ';
    return prefix + parts.join(' ');
  };

  const getUrgencyStyles = () => {
    const pulseClass = pulse ? 'transform scale-105' : 'transform scale-100';
    const baseClass = 'transition-transform duration-200';
    
    switch (urgencyLevel) {
      case 'overdue':
        return `bg-red-100 text-red-800 border-red-200 animate-pulse ${baseClass}`;
      case 'critical':
        return `bg-red-50 text-red-700 border-red-200 ${baseClass} ${pulseClass}`;
      case 'warning':
        return `bg-yellow-50 text-yellow-700 border-yellow-200 ${baseClass} ${pulseClass}`;
      case 'safe':
        return `bg-green-50 text-green-700 border-green-200 ${baseClass}`;
      default:
        return `bg-gray-50 text-gray-700 border-gray-200 ${baseClass}`;
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
    <div className="flex items-center gap-2">
      <Badge 
        className={`${className} ${getUrgencyStyles()} font-medium`}
        variant="outline"
      >
        {getIcon()}
        {formatTimeDisplay()}
      </Badge>
      {(urgencyLevel === 'critical' || urgencyLevel === 'warning') && timeRemaining && (
        <div className="text-xs text-muted-foreground font-mono">
          {String(timeRemaining.hours).padStart(2, '0')}:
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </div>
      )}
    </div>
  );
};