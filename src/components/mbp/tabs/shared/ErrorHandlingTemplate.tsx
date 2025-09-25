import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorHandlingTemplateProps {
  title: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export const ErrorHandlingTemplate: React.FC<ErrorHandlingTemplateProps> = ({
  title,
  description,
  error,
  onRetry,
  children
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {error && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">Error Details:</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          )}
          
          {children}
          
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Loading state template
interface LoadingTemplateProps {
  message?: string;
  className?: string;
}

export const LoadingTemplate: React.FC<LoadingTemplateProps> = ({
  message = "Loading...",
  className = "min-h-[400px]"
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Empty state template
interface EmptyStateTemplateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyStateTemplate: React.FC<EmptyStateTemplateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4 max-w-md">
        {icon && (
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};