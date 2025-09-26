import React, { ReactNode } from 'react';
import { useCompany } from '@/hooks/useCompany';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { ErrorHandlingTemplate, LoadingTemplate, EmptyStateTemplate } from '../tabs/shared/ErrorHandlingTemplate';

interface BaseMBPTabProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isEmpty?: boolean;
  className?: string;
}

export const BaseMBPTab: React.FC<BaseMBPTabProps> = ({
  title,
  description,
  children,
  loading = false,
  error = null,
  onRefresh,
  onAdd,
  addButtonLabel = 'Add New',
  emptyStateTitle,
  emptyStateDescription,
  isEmpty = false,
  className = '',
}) => {
  const { currentCompany } = useCompany();

  if (!currentCompany) {
    return (
      <ErrorHandlingTemplate
        title="No Company Selected"
        description="Please select or create a company to continue"
      />
    );
  }

  if (error) {
    return (
      <ErrorHandlingTemplate
        title="Error Loading Data"
        description="There was a problem loading the data for this tab."
        error={error}
        onRetry={onRefresh}
      />
    );
  }

  if (loading) {
    return <LoadingTemplate message={`Loading ${title.toLowerCase()}...`} />;
  }

  if (isEmpty && emptyStateTitle) {
    return (
      <EmptyStateTemplate
        title={emptyStateTitle}
        description={emptyStateDescription}
        actionLabel={addButtonLabel}
        onAction={onAdd}
        icon={<Plus className="h-12 w-12 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
            {onAdd && (
              <Button onClick={onAdd} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};