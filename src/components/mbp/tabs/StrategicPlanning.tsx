import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';  
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Target, Calendar, User, TrendingUp, Edit2, Check, X, ChevronDown, ChevronRight, CheckSquare, Square, Trash2, CheckCircle, ChevronUp, ArrowUpDown, Share2, Copy, Eye, Edit3 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useStrategicPlanning } from '@/hooks/useStrategicPlanning';
import { ErrorHandlingTemplate, LoadingTemplate, EmptyStateTemplate } from '@/components/mbp/tabs/shared/ErrorHandlingTemplate';
import { CountdownTimer } from '@/components/mbp/tabs/shared/CountdownTimer';
import { PerformanceGauge } from '@/components/mbp/tabs/shared/PerformanceGauge';
import { SimpleCollaborationButton } from '@/components/mbp/tabs/shared/SimpleCollaborationButton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { safeSort, cmpByDue, cmpByPriority, safeDate } from '@/lib/sort';
import type { StrategicObjective } from '@/types/strategicPlanning';
import { CopyLinkButton } from '@/components/strategic/CopyLinkButton';
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const CollaborationPanel = React.lazy(() => import('@/components/common/CollaborationPanel').then(module => ({ default: module.CollaborationPanel })));

// ---------- Sharing Utils ----------
const getShares = () => {
  try {
    return JSON.parse(localStorage.getItem("strategic_shares") || "{}");
  } catch {
    return {};
  }
};

const saveShares = (shares: any) => {
  localStorage.setItem("strategic_shares", JSON.stringify(shares));
};

// Generate permanent tokens for objectives
const getOrCreateToken = (objectiveId: string, mode: "viewer" | "editor") => {
  const shares = getShares();
  if (!shares[objectiveId]) shares[objectiveId] = { viewer: null, editor: null, accepted: [] };
  if (!shares[objectiveId][mode]) shares[objectiveId][mode] = uuidv4();
  saveShares(shares);
  return shares[objectiveId][mode];
};

// Add accepted objective to mini-dashboard
const acceptShare = (token: string, mode: string, objectiveId: string) => {
  const shares = getShares();
  if (!shares[objectiveId]) return;
  if (!shares[objectiveId].accepted.includes(token)) {
    shares[objectiveId].accepted.push(token);
    saveShares(shares);
  }
};

// Revoke individual token
const revokeShare = (objectiveId: string, token: string) => {
  const shares = getShares();
  if (!shares[objectiveId]) return;
  // Remove token from viewer/editor slots
  if (shares[objectiveId].viewer === token) shares[objectiveId].viewer = null;
  if (shares[objectiveId].editor === token) shares[objectiveId].editor = null;
  // Remove from accepted list
  shares[objectiveId].accepted = (shares[objectiveId].accepted || []).filter((t: string) => t !== token);
  saveShares(shares);
};

// ---------- Share Page ----------
const SharePage = () => {
  const { token, mode } = useParams();
  const navigate = useNavigate();
  const shares = getShares();
  let foundObjectiveId: string | null = null;
  let foundObjective: StrategicObjective | null = null;

  // Find objective by token
  for (const [objectiveId, data] of Object.entries<any>(shares)) {
    if (data[mode as "viewer" | "editor"] === token) {
      foundObjectiveId = objectiveId;
      acceptShare(token!, mode!, objectiveId);
      break;
    }
  }

  const { objectives } = useStrategicPlanning();
  
  if (foundObjectiveId) {
    foundObjective = objectives.find(obj => obj.id === foundObjectiveId) || null;
  }

  if (!foundObjectiveId || !foundObjective) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid or revoked link</h2>
            <p className="text-muted-foreground mb-4">This share link is no longer valid or has been revoked.</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">
            {mode === "viewer" ? "Viewing" : "Editing"} Mode
          </Badge>
          <Link to="/strategic-planning/my-shares" className="text-blue-600 hover:underline text-sm">
            Go to My Shares
          </Link>
        </div>
        <h1 className="text-2xl font-bold">{foundObjective.title}</h1>
        <p className="text-muted-foreground">{foundObjective.description}</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge className="mt-1">{foundObjective.status?.replace('_', ' ')}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Badge className="mt-1">{foundObjective.priority}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Target Date</Label>
              <p className="text-sm">
                {foundObjective.target_date ? 
                  new Date(foundObjective.target_date).toLocaleString() : 
                  '—'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Progress</Label>
              <div className="mt-1">
                <Progress value={foundObjective.completion_percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{foundObjective.completion_percentage}%</p>
              </div>
            </div>
          </div>
          
          {mode === "editor" ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Checklist Items</h3>
              <div className="space-y-2">
                {foundObjective.checklist?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded border">
                    <Checkbox checked={item.is_completed} disabled />
                    <span className={item.is_completed ? "line-through text-muted-foreground" : ""}>
                      {item.item_text}
                    </span>
                  </div>
                ))}
                {(!foundObjective.checklist || foundObjective.checklist.length === 0) && (
                  <p className="text-muted-foreground text-sm">No checklist items yet</p>
                )}
              </div>
              <div className="pt-4 border-t">
                <Textarea 
                  placeholder="Add comments or notes about this objective..." 
                  className="min-h-20"
                />
                <Button className="mt-2" size="sm">Add Comment</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Checklist Progress</h3>
              <div className="space-y-2">
                {foundObjective.checklist?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded border">
                    <CheckCircle className={`h-4 w-4 ${item.is_completed ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={item.is_completed ? "line-through text-muted-foreground" : ""}>
                      {item.item_text}
                    </span>
                  </div>
                ))}
                {(!foundObjective.checklist || foundObjective.checklist.length === 0) && (
                  <p className="text-muted-foreground text-sm">No checklist items to display</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- My Shares Dashboard ----------
const MyShares = () => {
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();
  const shares = getShares();
  const accepted: { objectiveId: string; mode: string; token: string }[] = [];

  for (const [objectiveId, data] of Object.entries<any>(shares)) {
    (data.accepted || []).forEach((token: string) => {
      const mode = data.viewer === token ? "viewer" : data.editor === token ? "editor" : "revoked";
      if (mode !== "revoked") accepted.push({ objectiveId, mode, token });
    });
  }

  const { objectives } = useStrategicPlanning();

  const handleRevoke = (objectiveId: string, token: string) => {
    revokeShare(objectiveId, token);
    setRefresh((r) => r + 1); // trigger re-render
    toast.success("Share access revoked");
  };

  if (!accepted.length) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">My Shared Objectives</h1>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            ← Back to Strategic Planning
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No shared objectives accessed yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              When you access shared objectives via links, they'll appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Shared Objectives</h1>
        <Button onClick={() => navigate("/")} variant="outline" size="sm">
          ← Back to Strategic Planning
        </Button>
      </div>
      
      <div className="space-y-4">
        {accepted.map((share, idx) => {
          const objective = objectives.find(obj => obj.id === share.objectiveId);
          return (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {share.mode === "viewer" ? "Viewer" : "Editor"}
                      </Badge>
                      {objective && <h3 className="font-semibold">{objective.title}</h3>}
                    </div>
                    {objective && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {objective.description}
                      </p>
                    )}
                    {!objective && (
                      <p className="text-sm text-muted-foreground">
                        Objective #{share.objectiveId} (data not available)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/strategic-planning/share/${share.token}/${share.mode}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRevoke(share.objectiveId, share.token)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
const cmpObjectivesByDue = (a: StrategicObjective, b: StrategicObjective) => 
  safeDate(a?.target_date) - safeDate(b?.target_date);

const cmpObjectivesByPriority = (a: StrategicObjective, b: StrategicObjective) => {
  const RANK = { critical: 0, high: 1, medium: 2, low: 3 };
  const ra = a?.priority && RANK[a.priority] !== undefined ? RANK[a.priority] : 99;
  const rb = b?.priority && RANK[b.priority] !== undefined ? RANK[b.priority] : 99;
  return ra - rb;
};

interface NewObjectiveForm {
  title: string;
  description: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  completion_percentage: number;
}

export const StrategicPlanningMain = () => {
  const {
    objectives,
    stats,
    loading,
    error,
    createObjective,
    updateObjective,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addCollaborator,
    addComment,
    addingCollaborator,
    addingComment
  } = useStrategicPlanning();
  
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<'priority'|'due'>('priority');
  const [newObjective, setNewObjective] = useState<NewObjectiveForm>({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    status: 'not_started',
    completion_percentage: 0
  });

  // Derive sorted objectives
  const sortedObjectives = useMemo(() => {
    const cmp = sortMode === 'priority' ? cmpObjectivesByPriority : cmpObjectivesByDue;
    return safeSort(objectives, cmp);
  }, [objectives, sortMode]);

  // Removed manual fetch logic - now using useStrategicPlanning hook

  const handleAddObjective = async () => {
    if (!newObjective.title) return;

    createObjective({
      title: newObjective.title,
      description: newObjective.description,
      target_date: newObjective.target_date,
      priority: newObjective.priority,
      status: newObjective.status,
      completion_percentage: newObjective.completion_percentage,
      company_id: '' // This will be set by the hook
    });
    
    setNewObjective({
      title: '',
      description: '',
      target_date: '',
      priority: 'medium',
      status: 'not_started',
      completion_percentage: 0
    });
    setIsAddingObjective(false);
  };

  const handleUpdateObjective = (objectiveId: string, updates: Partial<StrategicObjective>) => {
    // Remove related data fields that aren't columns in the table
    const { checklist, collaborators, comments, activity, ...dbUpdates } = updates;
    updateObjective({ id: objectiveId, data: dbUpdates });
  };

  const handleAddChecklistItem = (objectiveId: string, itemText: string) => {
    if (!itemText.trim()) return;

    const objective = objectives.find(obj => obj.id === objectiveId);
    const sortOrder = (objective?.checklist?.length || 0) + 1;

    createChecklistItem({
      objective_id: objectiveId,
      item_text: itemText.trim(),
      sort_order: sortOrder
    });
  };

  const handleUpdateChecklistItem = (itemId: string, updates: { is_completed?: boolean }) => {
    updateChecklistItem({ id: itemId, data: updates });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    deleteChecklistItem(itemId);
  };

  const toggleCardExpansion = (objectiveId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedCards(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'on_hold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const ObjectiveCard = ({ objective }: { objective: StrategicObjective }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const isExpanded = expandedCards.has(objective.id);
    const completedItems = objective.checklist?.filter(item => item.is_completed).length || 0;
    const totalItems = objective.checklist?.length || 0;
    
    // Calculate completion percentage based on checklist items
    const calculatedCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const [editData, setEditData] = useState({
      ...objective,
      status: objective.status || 'not_started',
      priority: objective.priority || 'medium',
      completion_percentage: calculatedCompletion, // Use calculated value
      description: objective.description || '',
      target_date: objective.target_date || ''
    });

    const handleSave = () => {
      // Update with calculated completion percentage
      const updatedData = {
        ...editData,
        completion_percentage: calculatedCompletion
      };
      handleUpdateObjective(objective.id, updatedData);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditData({
        ...objective,
        status: objective.status || 'not_started',
        priority: objective.priority || 'medium',
        completion_percentage: calculatedCompletion, // Use calculated value
        description: objective.description || '',
        target_date: objective.target_date || ''
      });
      setIsEditing(false);
    };

    const addChecklistItem = () => {
      if (newChecklistItem.trim()) {
        handleAddChecklistItem(objective.id, newChecklistItem);
        setNewChecklistItem('');
      }
    };

    return (
      <Card 
        key={objective.id} 
        className={`transition-all duration-200 hover:shadow-md cursor-pointer group ${isExpanded ? 'ring-2 ring-blue-200' : ''}`}
      >
        <CardHeader 
          className="pb-3"
          onClick={() => !isEditing && toggleCardExpansion(objective.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="text-lg font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h4 className="text-lg font-semibold truncate">{objective.title}</h4>
                )}
              </div>
              
              {/* Countdown Timer - TEMPORARILY REMOVED FOR DEBUGGING */}
              {/* <div className="mb-2">
                <CountdownTimer 
                  targetDate={objective.target_date}
                  isCompleted={totalItems > 0 && completedItems === totalItems}
                  completedAt={totalItems > 0 && completedItems === totalItems ? 
                    objective.checklist?.filter(item => item.is_completed)
                      .reduce((latest, item) => 
                        !latest || new Date(item.updated_at) > new Date(latest) ? 
                        item.updated_at : latest, null as string | null) : null
                  }
                />
              </div> */}
              
              {!isExpanded && (
                <p className="text-sm text-muted-foreground line-clamp-2">{objective.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              
              {/* Sharing Buttons */}
              {!isEditing && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const token = getOrCreateToken(objective.id, "viewer");
                      const url = `${window.location.origin}/strategic-planning/share/${token}/viewer`;
                      navigator.clipboard.writeText(url);
                      toast.success("Viewer link copied!");
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const token = getOrCreateToken(objective.id, "editor");
                      const url = `${window.location.origin}/strategic-planning/share/${token}/editor`;
                      navigator.clipboard.writeText(url);
                      toast.success("Editor link copied!");
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col items-end gap-1">
                <Badge className={getPriorityColor(objective.priority || 'medium')}>
                  {objective.priority || 'medium'}
                </Badge>
                <Badge className={getStatusColor(objective.status || 'not_started')}>
                  {(objective.status || 'not_started').replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar - using calculated completion with completion status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{calculatedCompletion}%</span>
                {totalItems > 0 && completedItems === totalItems && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={calculatedCompletion} className="h-2" />
            {totalItems > 0 ? (
              <div className="text-sm text-muted-foreground">
                {completedItems} of {totalItems} checklist items completed
                {completedItems === totalItems && totalItems > 0 && (
                  <span className="text-green-600 font-medium ml-2">✓ All done!</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Add checklist items to track progress
              </div>
            )}
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={editData.status} 
                        onValueChange={(value: 'not_started' | 'in_progress' | 'completed' | 'on_hold') => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={editData.priority} 
                        onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setEditData({ ...editData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label>Target Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={editData.target_date || ''}
                        onChange={(e) => setEditData({ ...editData, target_date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground">{objective.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {Number.isFinite(safeDate(objective.target_date)) ? 
                          new Date(objective.target_date).toLocaleString() : 
                          '—'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {calculatedCompletion}% complete (auto-calculated)
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Checklist Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Checklist ({completedItems}/{totalItems})
                      </h5>
                      <ErrorBoundary fallback={null}>
                        <SimpleCollaborationButton objective={objective} />
                      </ErrorBoundary>
                    </div>
                    
                    {objective.checklist && objective.checklist.length > 0 && (
                      <div className="space-y-2">
                        {objective.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Checkbox
                              checked={item.is_completed}
                              onCheckedChange={(checked) => 
                                handleUpdateChecklistItem(item.id, { is_completed: checked as boolean })
                              }
                            />
                            <span className={`flex-1 ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.item_text}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add checklist item..."
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                      />
                      <Button onClick={addChecklistItem} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <ErrorBoundary fallback={null}>
                      <Suspense fallback={null}>
                        <CollaborationPanel cardId={objective.id} />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Show loading template if loading
  if (loading) {
    return <LoadingTemplate message="Loading strategic objectives..." />;
  }

  // Show error template if error
  if (error) {
    return (
      <ErrorHandlingTemplate
        title="Error Loading Strategic Objectives"
        description="There was a problem loading your strategic planning data."
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Gauge */}
      <PerformanceGauge objectives={objectives} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Strategic Planning</h3>
          <p className="text-sm text-muted-foreground">
            Define and track your strategic goals and initiatives. Click cards to expand and edit.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/strategic-planning/my-shares" 
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            My Shares
          </Link>
          <div style={{display:'flex', gap:8}}>
            <button 
              aria-pressed={sortMode==='priority'} 
              onClick={()=>setSortMode('priority')}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                sortMode === 'priority' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-accent border-input'
              }`}
            >
              Priority
            </button>
            <button 
              aria-pressed={sortMode==='due'} 
              onClick={()=>setSortMode('due')}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                sortMode === 'due' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-accent border-input'
              }`}
            >
              Due date
            </button>
          </div>
          <Dialog open={isAddingObjective} onOpenChange={setIsAddingObjective}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Strategic Objective
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Strategic Objective</DialogTitle>
                <DialogDescription>
                  Create a new strategic objective or initiative
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Objective Title</Label>
                  <Input
                    value={newObjective.title}
                    onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                    placeholder="e.g., Expand to New Markets"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newObjective.description}
                    onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                    placeholder="Describe the objective, goals, and expected outcomes..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={newObjective.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setNewObjective({ ...newObjective, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <div>
                      <Label>Target Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newObjective.target_date}
                        onChange={(e) => setNewObjective({ ...newObjective, target_date: e.target.value })}
                      />
                    </div>
                </div>
                
                <Button 
                  onClick={handleAddObjective} 
                  className="w-full"
                  disabled={!newObjective.title}
                >
                  Add Strategic Objective
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {objectives.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {objectives.filter(o => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {objectives.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" />
              Critical Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {objectives.filter(o => o.priority === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Objectives */}
      <div className="space-y-4">
        {objectives.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold mb-2">No Strategic Objectives</h4>
            <p className="text-muted-foreground mb-4">Start by creating your first strategic objective to guide your business planning.</p>
            <Dialog open={isAddingObjective} onOpenChange={setIsAddingObjective}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Objective
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        ) : (
          <div className="space-y-4 group">
            {sortedObjectives.map((objective) => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Main Strategic Planning ----------
export const StrategicPlanning = () => {
  return <StrategicPlanningMain />;
};