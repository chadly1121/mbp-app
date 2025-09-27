import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { ChecklistItem } from '@/types/strategicPlanning';

interface ChecklistItemProps {
  item: ChecklistItem;
  onUpdate: (id: string, data: { item_text?: string; is_completed?: boolean }) => void;
  onDelete: (id: string) => void;
}

export const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({
  item,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.item_text);

  const handleSave = () => {
    if (editText.trim() !== item.item_text) {
      onUpdate(item.id, { item_text: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(item.item_text);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(item.id, { is_completed: !item.is_completed });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={handleToggleComplete}
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span
            className={`text-sm cursor-pointer ${
              item.is_completed
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
            onClick={() => setIsEditing(true)}
          >
            {item.item_text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};