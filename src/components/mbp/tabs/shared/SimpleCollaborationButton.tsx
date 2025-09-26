import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare } from 'lucide-react';
import type { StrategicObjective } from '@/types/strategicPlanning';

interface SimpleCollaborationButtonProps {
  objective: StrategicObjective;
}

export const SimpleCollaborationButton = ({
  objective
}: SimpleCollaborationButtonProps) => {
  const collaboratorCount = objective.collaborators?.length || 0;
  const commentCount = objective.comments?.length || 0;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        <Users className="h-3 w-3 mr-1" />
        {collaboratorCount}
      </Badge>
      <Badge variant="outline" className="text-xs">
        <MessageSquare className="h-3 w-3 mr-1" />
        {commentCount}
      </Badge>
    </div>
  );
};