import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

interface ObjectiveCardProps {
  objective: { 
    id: string; 
    title: string;
  };
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [newItemDue, setNewItemDue] = useState("");

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).slice(2),
      text: newItemText.trim(),
      completed: false,
      dueDate: newItemDue || undefined
    };
    
    setChecklist(prev => [...prev, newItem]);
    setNewItemText("");
    setNewItemDue("");
  };

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;

  return (
    <div className="border border-border rounded-lg p-4 mb-3 bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{objective.title}</h3>
        {totalCount > 0 && (
          <Badge variant="secondary">
            {completedCount}/{totalCount} complete
          </Badge>
        )}
      </div>

      {/* Add new checklist item */}
      <div className="flex gap-2 mb-3">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add checklist item"
          onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
          className="flex-1"
        />
        <Input
          type="date"
          value={newItemDue}
          onChange={(e) => setNewItemDue(e.target.value)}
          className="w-auto"
        />
        <Button onClick={addChecklistItem} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50">
            <div className="flex items-center gap-2 flex-1">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <span className={`text-sm ${
                item.completed 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground'
              }`}>
                {item.text}
              </span>
              {item.dueDate && (
                <Badge variant="outline" className="text-xs ml-2">
                  Due {new Date(item.dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteItem(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}