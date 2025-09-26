import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { StrategicObjective } from '@/types/strategicPlanning';

interface BasicCollaborationButtonProps {
  objective: StrategicObjective;
}

export const BasicCollaborationButton: React.FC<BasicCollaborationButtonProps> = ({
  objective,
}) => {
  const handleClick = () => {
    // For now, just show an alert with collaboration info
    const collaborators = objective.collaborators?.length || 0;
    const comments = objective.comments?.length || 0;
    const activity = objective.activity?.length || 0;
    
    alert(`Collaboration Status for "${objective.title}":
• Team Members: ${collaborators}
• Comments: ${comments} 
• Activities: ${activity}

Full collaboration features coming soon!`);
  };

  const totalItems = (objective.collaborators?.length || 0) + (objective.comments?.length || 0);

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2" 
      onClick={handleClick}
    >
      <Users className="w-4 h-4" />
      Collaborate ({totalItems})
    </Button>
  );
};