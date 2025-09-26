import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare } from 'lucide-react';
import type { StrategicObjective } from '@/types/strategicPlanning';

interface SimpleCollaborationButtonProps {
  objective: StrategicObjective;
}

export const SimpleCollaborationButton: React.FC<SimpleCollaborationButtonProps> = ({
  objective
}) => {
  console.log('SimpleCollaborationButton rendering for objective:', objective.id);
  console.log('Collaboration data:', {
    collaborators: objective.collaborators,
    comments: objective.comments,
    activity: objective.activity
  });

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
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          console.log('Collaboration clicked for:', objective.id);
          alert(`Collaboration for ${objective.title}\nCollaborators: ${collaboratorCount}\nComments: ${commentCount}`);
        }}
      >
        <Users className="h-4 w-4" />
      </Button>
    </div>
  );
};