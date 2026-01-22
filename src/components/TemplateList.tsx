import { Plus, Copy, Trash2, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedTemplate } from '@/types/imageGenerator';
import { cn } from '@/lib/utils';

interface TemplateListProps {
  templates: SavedTemplate[];
  activeTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onCreateTemplate: () => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  onRenameTemplate: (id: string, name: string) => void;
}

export const TemplateList = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onRenameTemplate,
}: TemplateListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (template: SavedTemplate) => {
    setEditingId(template.id);
    setEditName(template.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onRenameTemplate(id, editName.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/30">
      <div className="p-3 border-b">
        <Button onClick={() => onCreateTemplate()} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates yet.
              <br />
              Create one to get started.
            </p>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  'group rounded-lg border p-2 cursor-pointer transition-colors',
                  activeTemplateId === template.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background hover:bg-muted'
                )}
                onClick={() => onSelectTemplate(template.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-video rounded bg-muted mb-2 overflow-hidden">
                  {template.baseplateDataUrl ? (
                    <img
                      src={template.baseplateDataUrl}
                      alt={template.name}
                      className="w-full h-full object-contain bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaGVja2VyYm9hcmQpIi8+PC9zdmc+')]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Name */}
                {editingId === template.id ? (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(template.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(template.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cancelEdit()}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{template.name}</span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(template);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateTemplate(template.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(template.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
