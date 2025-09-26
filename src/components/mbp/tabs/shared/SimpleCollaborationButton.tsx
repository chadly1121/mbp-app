import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollaborationPanel } from './CollaborationPanel';
import type { StrategicObjective } from '@/types/strategicPlanning';

interface SimpleCollaborationButtonProps {
  objective: StrategicObjective;
  onAddCollaborator?: (request: any) => Promise<void>;
  onAddComment?: (request: any) => Promise<void>;
  isAddingCollaborator?: boolean;
  isAddingComment?: boolean;
}

export const SimpleCollaborationButton = ({
  objective,
  onAddCollaborator,
  onAddComment,
  isAddingCollaborator = false,
  isAddingComment = false
}: SimpleCollaborationButtonProps) => {
  const { toast } = useToast();
  
  const collaboratorCount = objective.collaborators?.length || 0;
  const commentCount = objective.comments?.length || 0;

  // Default handlers if not provided
  const handleAddCollaborator = onAddCollaborator || (async (request: any) => {
    toast({
      title: "Coming Soon",
      description: "Collaborator invitations will be available soon!",
    });
  });

  const handleAddComment = onAddComment || (async (request: any) => {
    toast({
      title: "Coming Soon", 
      description: "Comments will be available soon!",
    });
  });

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
      <CollaborationPanel
        objective={objective}
        onAddCollaborator={handleAddCollaborator}
        onAddComment={handleAddComment}
        isAddingCollaborator={isAddingCollaborator}
        isAddingComment={isAddingComment}
      />
    </div>
  );
};