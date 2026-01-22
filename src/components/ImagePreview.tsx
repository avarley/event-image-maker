import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GeneratedImage } from '@/types/imageGenerator';

interface ImagePreviewProps {
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  onDownload: (image: GeneratedImage) => void;
}

export const ImagePreview = ({
  generatedImages,
  isGenerating,
  onDownload,
}: ImagePreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Generated Images
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generatedImages.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
            {isGenerating ? 'Generating...' : 'No images generated yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedImages.map((image) => (
              <div key={image.eventId} className="relative group">
                <img
                  src={image.dataUrl}
                  alt={image.eventName}
                  className="w-full rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDownload(image)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <p className="mt-2 text-sm font-medium truncate">{image.eventName}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
