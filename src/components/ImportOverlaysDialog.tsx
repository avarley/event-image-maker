import { useState, useMemo } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SavedTemplate, SavedOverlay } from '@/types/imageGenerator';
import { toast } from 'sonner';

interface ImportOverlaysDialogProps {
  currentTemplate: SavedTemplate;
  allTemplates: SavedTemplate[];
  onImportOverlays: (overlays: SavedOverlay[]) => void;
}

export const ImportOverlaysDialog = ({
  currentTemplate,
  allTemplates,
  onImportOverlays,
}: ImportOverlaysDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOverlays, setSelectedOverlays] = useState<Set<string>>(new Set());

  // Get all overlays from other templates (not the current one)
  const otherTemplatesWithOverlays = useMemo(() => {
    return allTemplates
      .filter((t) => t.id !== currentTemplate.id && (t.overlays?.length || 0) > 0)
      .map((t) => ({
        template: t,
        overlays: t.overlays || [],
      }));
  }, [allTemplates, currentTemplate.id]);

  const toggleOverlay = (overlayId: string) => {
    setSelectedOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(overlayId)) {
        next.delete(overlayId);
      } else {
        next.add(overlayId);
      }
      return next;
    });
  };

  const selectAllFromTemplate = (templateId: string) => {
    const template = otherTemplatesWithOverlays.find((t) => t.template.id === templateId);
    if (!template) return;
    
    setSelectedOverlays((prev) => {
      const next = new Set(prev);
      template.overlays.forEach((o) => next.add(o.id));
      return next;
    });
  };

  const handleImport = () => {
    // Collect all selected overlays with new IDs to avoid conflicts
    const overlaysToImport: SavedOverlay[] = [];
    
    for (const { overlays } of otherTemplatesWithOverlays) {
      for (const overlay of overlays) {
        if (selectedOverlays.has(overlay.id)) {
          overlaysToImport.push({
            ...overlay,
            id: crypto.randomUUID(), // New ID to avoid conflicts
          });
        }
      }
    }

    if (overlaysToImport.length === 0) {
      toast.error('No overlays selected');
      return;
    }

    onImportOverlays(overlaysToImport);
    toast.success(`Imported ${overlaysToImport.length} overlay(s)`);
    setSelectedOverlays(new Set());
    setOpen(false);
  };

  const hasOverlaysToImport = otherTemplatesWithOverlays.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasOverlaysToImport}>
          <Download className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Overlays</DialogTitle>
          <DialogDescription>
            Select overlays from other templates to add to "{currentTemplate.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {otherTemplatesWithOverlays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No overlays available in other templates.
            </p>
          ) : (
            otherTemplatesWithOverlays.map(({ template, overlays }) => (
              <div key={template.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{template.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectAllFromTemplate(template.id)}
                  >
                    Select All
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {overlays.map((overlay) => (
                    <label
                      key={overlay.id}
                      className={`relative flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedOverlays.has(overlay.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedOverlays.has(overlay.id)}
                          onCheckedChange={() => toggleOverlay(overlay.id)}
                        />
                      </div>
                      {selectedOverlays.has(overlay.id) && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <img
                        src={overlay.dataUrl}
                        alt={overlay.name}
                        className="w-16 h-16 object-contain rounded bg-muted"
                      />
                      <span className="text-xs text-center truncate w-full">
                        {overlay.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={selectedOverlays.size === 0}>
            Import {selectedOverlays.size > 0 && `(${selectedOverlays.size})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
