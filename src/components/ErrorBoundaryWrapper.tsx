import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

/**
 * Reusable error boundary wrapper for unstable components
 */
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  fallback,
  componentName = 'Component'
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-destructive">
          {componentName} Error
        </h3>
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please refresh the page or try again later.
        </p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};