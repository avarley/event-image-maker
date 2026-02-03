import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, RefreshCw, User, Loader2 } from 'lucide-react';
import { SharedTemplate } from '@/types/sharedTemplates';
import { SavedTemplate } from '@/types/imageGenerator';

interface CommunityTemplatesProps {
  sharedTemplates: SharedTemplate[];
  isLoading: boolean;
  onRefresh: () => void;
  onImport: (template: SharedTemplate) => Promise<SavedTemplate | null>;
  onTemplateImported: (template: SavedTemplate) => void;
}

export const CommunityTemplates = ({
  sharedTemplates,
  isLoading,
  onRefresh,
  onImport,
  onTemplateImported,
}: CommunityTemplatesProps) => {
  const [importingId, setImportingId] = useState<string | null>(null);

  const handleImport = async (template: SharedTemplate) => {
    setImportingId(template.id);
    const imported = await onImport(template);
    if (imported) {
      onTemplateImported(imported);
    }
    setImportingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Community Templates</h3>
          <p className="text-sm text-muted-foreground">
            Browse and import templates shared by others
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading && sharedTemplates.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <Skeleton className="aspect-video w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sharedTemplates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No community templates yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to publish a template!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sharedTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardContent className="p-3">
                {/* Thumbnail */}
                <div className="aspect-video rounded bg-muted mb-2 overflow-hidden">
                  {template.baseplate_url ? (
                    <img
                      src={template.baseplate_url}
                      alt={template.name}
                      className="w-full h-full object-contain bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaGVja2VyYm9hcmQpIi8+PC9zdmc+')]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No preview
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h4 className="font-medium text-sm truncate">{template.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">
                      {template.author_name || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      {template.downloads_count || 0}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleImport(template)}
                      disabled={importingId === template.id}
                    >
                      {importingId === template.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
