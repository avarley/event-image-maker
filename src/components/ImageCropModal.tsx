import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatio?: number; // Default 3:2 = 1.5
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ImageCropModal = ({
  isOpen,
  onClose,
  imageDataUrl,
  onCropComplete,
  aspectRatio = 3 / 2,
}: ImageCropModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);

  // Initialize crop area when image loads
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Calculate display dimensions (image scaled to fit container)
    const maxWidth = containerRect.width;
    const maxHeight = 400;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let displayWidth = maxWidth;
    let displayHeight = displayWidth / imgAspect;

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * imgAspect;
    }

    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setDisplayDimensions({ width: displayWidth, height: displayHeight });

    // Initialize crop area - largest possible with correct aspect ratio
    let cropWidth: number;
    let cropHeight: number;

    if (displayWidth / displayHeight > aspectRatio) {
      // Image is wider than aspect ratio - constrain by height
      cropHeight = displayHeight * 0.8;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Image is taller than aspect ratio - constrain by width
      cropWidth = displayWidth * 0.8;
      cropHeight = cropWidth / aspectRatio;
    }

    setCropArea({
      x: (displayWidth - cropWidth) / 2,
      y: (displayHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  }, [imageLoaded, aspectRatio]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'move' | 'resize') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragType) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCropArea(prev => {
      if (dragType === 'move') {
        let newX = prev.x + deltaX;
        let newY = prev.y + deltaY;

        // Constrain to image bounds
        newX = Math.max(0, Math.min(newX, displayDimensions.width - prev.width));
        newY = Math.max(0, Math.min(newY, displayDimensions.height - prev.height));

        return { ...prev, x: newX, y: newY };
      } else if (dragType === 'resize') {
        // Resize from bottom-right corner, maintaining aspect ratio
        let newWidth = prev.width + deltaX;
        let newHeight = newWidth / aspectRatio;

        // Minimum size
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50 / aspectRatio, newHeight);

        // Constrain to image bounds
        if (prev.x + newWidth > displayDimensions.width) {
          newWidth = displayDimensions.width - prev.x;
          newHeight = newWidth / aspectRatio;
        }
        if (prev.y + newHeight > displayDimensions.height) {
          newHeight = displayDimensions.height - prev.y;
          newWidth = newHeight * aspectRatio;
        }

        return { ...prev, width: newWidth, height: newHeight };
      }
      return prev;
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragType, dragStart, displayDimensions, aspectRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  const handleCrop = useCallback(() => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / displayDimensions.width;
    const scaleY = img.naturalHeight / displayDimensions.height;

    // Calculate crop area in original image coordinates
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    // Create canvas for cropped image
    const canvas = document.createElement('canvas');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, sourceWidth, sourceHeight
    );

    const croppedDataUrl = canvas.toDataURL('image/png');
    onCropComplete(croppedDataUrl);
    onClose();
  }, [cropArea, displayDimensions, onCropComplete, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Image (3:2 Aspect Ratio)
          </DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative select-none overflow-hidden bg-muted rounded-lg"
          style={{ minHeight: 200 }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageDataUrl && (
            <div className="flex items-center justify-center">
              <div
                className="relative"
                style={{
                  width: displayDimensions.width || 'auto',
                  height: displayDimensions.height || 'auto',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageDataUrl}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  className="block max-w-full"
                  style={{
                    width: displayDimensions.width || 'auto',
                    height: displayDimensions.height || 'auto',
                  }}
                  draggable={false}
                />

                {imageLoaded && (
                  <>
                    {/* Overlay outside crop area */}
                    <div
                      className="absolute inset-0 bg-black/50 pointer-events-none"
                      style={{
                        clipPath: `polygon(
                          0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                          ${cropArea.x}px ${cropArea.y}px,
                          ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                          ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                          ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                          ${cropArea.x}px ${cropArea.y}px
                        )`,
                      }}
                    />

                    {/* Crop box */}
                    <div
                      className="absolute border-2 border-white cursor-move"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0)',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'move')}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
                      </div>

                      {/* Resize handle */}
                      <div
                        className="absolute bottom-0 right-0 w-5 h-5 bg-white border border-gray-400 cursor-se-resize"
                        style={{ transform: 'translate(50%, 50%)' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, 'resize');
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!imageLoaded}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
