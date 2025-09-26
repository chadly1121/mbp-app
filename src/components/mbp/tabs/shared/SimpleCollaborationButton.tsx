import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StrategicObjective } from '@/types/strategicPlanning';

interface SimpleCollaborationButtonProps {
  objective: StrategicObjective;
}

export const SimpleCollaborationButton = ({
  objective
}: SimpleCollaborationButtonProps) => {
  const { toast } = useToast();
  
  const collaboratorCount = objective.collaborators?.length || 0;
  const commentCount = objective.comments?.length || 0;

  const handleCollaborationClick = () => {
    toast({
      title: "Collaboration",
      description: `${objective.title} has ${collaboratorCount} collaborators and ${commentCount} comments.`,
    });
  };

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
        onClick={handleCollaborationClick}
      >
        <Users className="h-4 w-4" />
      </Button>
    </div>
  );
};