import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  className,
  variant = 'default' 
}: MetricCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-gradient-to-br from-success/5 to-success/10';
      case 'warning':
        return 'border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10';
      case 'info':
        return 'border-info/20 bg-gradient-to-br from-info/5 to-info/10';
      case 'destructive':
        return 'border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10';
      default:
        return 'bg-gradient-card';
    }
  };

  const getChangeColor = () => {
    switch (change?.trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "shadow-md hover:shadow-lg transition-all duration-200",
      getVariantStyles(),
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {value}
            </p>
            {change && (
              <p className={cn("text-xs font-medium", getChangeColor())}>
                {change.value}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              variant === 'success' ? 'bg-success/10 text-success' :
              variant === 'warning' ? 'bg-warning/10 text-warning' :
              variant === 'info' ? 'bg-info/10 text-info' :
              variant === 'destructive' ? 'bg-destructive/10 text-destructive' :
              'bg-primary/10 text-primary'
            )}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;