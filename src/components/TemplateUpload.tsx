import { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransparentRegion } from '@/types/imageGenerator';

interface TemplateUploadProps {
  baseplate: HTMLImageElement | null;
  transparentRegion: TransparentRegion | null;
  onBaseplateChange: (image: HTMLImageElement, dataUrl: string) => void;
  onTransparentRegionDetected: (region: TransparentRegion | null) => void;
  detectTransparentRegion: (image: HTMLImageElement) => TransparentRegion | null;
}

export const TemplateUpload = ({
  baseplate,
  transparentRegion,
  onBaseplateChange,
  onTransparentRegionDetected,
  detectTransparentRegion,
}: TemplateUploadProps) => {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          onBaseplateChange(img, event.target?.result as string);
          const region = detectTransparentRegion(img);
          onTransparentRegionDetected(region);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onBaseplateChange, onTransparentRegionDetected, detectTransparentRegion]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Template Baseplate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="cursor-pointer">
            <label>
              <Upload className="mr-2 h-4 w-4" />
              Upload PNG Template
              <input
                type="file"
                accept="image/png"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </Button>
        </div>

        {baseplate && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Template: {baseplate.width} × {baseplate.height}px
            </p>
            {transparentRegion ? (
              <p className="text-sm text-green-600">
                ✓ Transparent region detected: {transparentRegion.width} × {transparentRegion.height}px 
                at ({transparentRegion.x}, {transparentRegion.y})
              </p>
            ) : (
              <p className="text-sm text-amber-600">
                ⚠ No transparent region detected
              </p>
            )}
          </div>
        )}

        {baseplate && (
          <div className="relative border rounded-lg overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaGVja2VyYm9hcmQpIi8+PC9zdmc+')]">
            <img
              src={baseplate.src}
              alt="Template"
              className="max-w-full h-auto max-h-64 mx-auto"
            />
            {transparentRegion && (
              <div
                className="absolute border-2 border-dashed border-primary pointer-events-none"
                style={{
                  left: `${(transparentRegion.x / baseplate.width) * 100}%`,
                  top: `${(transparentRegion.y / baseplate.height) * 100}%`,
                  width: `${(transparentRegion.width / baseplate.width) * 100}%`,
                  height: `${(transparentRegion.height / baseplate.height) * 100}%`,
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
