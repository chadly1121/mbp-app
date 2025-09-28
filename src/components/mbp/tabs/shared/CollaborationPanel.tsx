import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, MessageSquare, Activity, UserPlus, Send, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import type { 
  StrategicObjective, 
  ObjectiveCollaborator, 
  ObjectiveComment, 
  ObjectiveActivity,
  CreateCollaboratorRequest,
  CreateCommentRequest
} from '@/types/strategicPlanning';

interface CollaborationPanelProps {
  objective: StrategicObjective;
  onAddCollaborator: (request: CreateCollaboratorRequest) => Promise<void>;
  onAddComment: (request: CreateCommentRequest) => Promise<void>;
  isAddingCollaborator?: boolean;
  isAddingComment?: boolean;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  objective,
  onAddCollaborator,
  onAddComment,
  isAddingCollaborator = false,
  isAddingComment = false,
}) => {
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<ObjectiveCollaborator['role']>('accountability_partner');
  const [newComment, setNewComment] = useState('');

  // Input validation schemas
  const collaboratorSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
    role: z.enum(['accountability_partner', 'collaborator', 'viewer'])
  });

  const commentSchema = z.object({
    content: z.string().trim().min(1, { message: "Comment cannot be empty" }).max(1000, { message: "Comment must be less than 1000 characters" })
  });

  const handleAddCollaborator = async () => {
    // Validate input
    const validation = collaboratorSchema.safeParse({
      email: newCollaboratorEmail,
      role: newCollaboratorRole
    });

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Invalid input";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return;
    }

    try {
      await onAddCollaborator({
        objective_id: objective.id,
        user_email: validation.data.email,
        role: validation.data.role,
      });
      setNewCollaboratorEmail('');
      toast({ title: "Success", description: `Collaborator invited as ${validation.data.role.replace('_', ' ')}!` });
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
      toast({ title: "Error", description: "Failed to invite collaborator. Please try again.", variant: "destructive" });
    }
  };

  const handleAddComment = async () => {
    // Validate input
    const validation = commentSchema.safeParse({
      content: newComment
    });

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Invalid input";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return;
    }

    try {
      await onAddComment({
        objective_id: objective.id,
        content: validation.data.content,
      });
      setNewComment('');
      toast({ title: "Success", description: "Comment added successfully!" });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({ title: "Error", description: "Failed to add comment. Please try again.", variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: ObjectiveCollaborator['role']) => {
    switch (role) {
      case 'accountability_partner': return 'default';
      case 'collaborator': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: ObjectiveCollaborator['status']) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'declined': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Collaborate ({(objective.collaborators?.length || 0) + (objective.comments?.length || 0)})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaboration - {objective.title}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="collaborators" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team ({objective.collaborators?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussion ({objective.comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity ({objective.activity?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collaborators" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <UserPlus className="w-4 h-4" />
                Invite Accountability Partner or Team Member
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Enter email address"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  type="email"
                  maxLength={255}
                />
                <Select value={newCollaboratorRole} onValueChange={(value) => setNewCollaboratorRole(value as ObjectiveCollaborator['role'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accountability_partner">Accountability Partner</SelectItem>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCollaborator} disabled={isAddingCollaborator}>
                  {isAddingCollaborator ? "Inviting..." : "Invite"}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {objective.collaborators?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No collaborators yet. Invite someone to help with accountability!
                  </div>
                ) : (
                  objective.collaborators?.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{collaborator.user_email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{collaborator.user_email}</div>
                          <div className="text-sm text-muted-foreground">
                            Invited {format(new Date(collaborator.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                          {collaborator.role.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(collaborator.status)}>
                          {collaborator.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Add Comment or Update
              </div>
              <div className="flex gap-3">
                <Textarea
                  placeholder="Share an update, ask for help, or provide feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  rows={3}
                  maxLength={1000}
                />
                <Button onClick={handleAddComment} disabled={isAddingComment} className="self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {objective.comments?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No comments yet. Start the discussion!
                  </div>
                ) : (
                  objective.comments?.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{comment.user_name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.user_name}</span>
                          <span className="text-xs text-muted-foreground">{comment.user_email}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed">{comment.content}</div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {objective.activity?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No activity yet.
                  </div>
                ) : (
                  objective.activity?.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-start gap-3 p-3">
                        <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <div className="text-sm">{activity.activity_description}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.user_name && `by ${activity.user_name} • `}
                            {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                      {index < (objective.activity?.length || 0) - 1 && <Separator />}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};