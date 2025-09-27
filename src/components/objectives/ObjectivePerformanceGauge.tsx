import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ObjectivePerformanceGaugeProps {
  completion: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ObjectivePerformanceGauge: React.FC<ObjectivePerformanceGaugeProps> = ({
  completion,
  size = 'md',
  showLabel = true
}) => {
  const getGaugeColor = (percentage: number) => {
    if (percentage >= 80) return 'hsl(var(--chart-2))'; // Green
    if (percentage >= 60) return 'hsl(var(--chart-4))'; // Yellow
    if (percentage >= 40) return 'hsl(var(--chart-3))'; // Orange
    return 'hsl(var(--chart-1))'; // Red
  };

  const sizeClasses = {
    sm: { container: 'w-16 h-16', stroke: '4', text: 'text-xs' },
    md: { container: 'w-20 h-20', stroke: '6', text: 'text-sm' },
    lg: { container: 'w-24 h-24', stroke: '8', text: 'text-base' }
  };

  const { container, stroke, text } = sizeClasses[size];
  const radius = size === 'sm' ? 26 : size === 'md' ? 30 : 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${container}`}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 80 80"
        >
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={getGaugeColor(completion)}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${text} text-foreground`}>
            {completion}%
          </span>
        </div>
      </div>
      
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium">
          Progress
        </span>
      )}
    </div>
  );
};