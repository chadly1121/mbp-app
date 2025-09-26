import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { StrategicObjective } from '@/types/strategicPlanning';

interface SimpleCollaborationPanelProps {
  objective: StrategicObjective;
}

export const SimpleCollaborationPanel: React.FC<SimpleCollaborationPanelProps> = ({
  objective,
}) => {
  const collaboratorCount = objective.collaborators?.length || 0;
  const commentCount = objective.comments?.length || 0;
  const totalCount = collaboratorCount + commentCount;

  return (
    <Button variant="outline" size="sm" className="gap-2" disabled>
      <Users className="w-4 h-4" />
      Collaborate ({totalCount}) - Coming Soon
    </Button>
  );
};