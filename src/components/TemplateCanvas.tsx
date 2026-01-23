import { useRef, useState, useEffect, useCallback } from 'react';
import { TextConfig } from '@/types/imageGenerator';

interface TemplateCanvasProps {
  baseplateUrl: string;
  textConfig: TextConfig;
  sampleText: string;
  onTextConfigChange: (config: TextConfig) => void;
}

export const TemplateCanvas = ({
  baseplateUrl,
  textConfig,
  sampleText,
  onTextConfigChange,
}: TemplateCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [baseplateSize, setBaseplateSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Load baseplate dimensions
  useEffect(() => {
    if (!baseplateUrl) return;
    const img = new Image();
    img.onload = () => {
      setBaseplateSize({ width: img.width, height: img.height });
    };
    img.src = baseplateUrl;
  }, [baseplateUrl]);

  // Calculate scale to fit canvas in container
  useEffect(() => {
    if (!containerRef.current || baseplateSize.width === 0) return;
    const containerWidth = containerRef.current.clientWidth;
    const maxWidth = Math.min(containerWidth, 800);
    const newScale = Math.min(1, maxWidth / baseplateSize.width);
    setScale(newScale);
  }, [baseplateSize]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      // Check if click is near text position
      const textX = textConfig.x;
      const textY = textConfig.y;
      const hitRadius = 50;

      if (
        Math.abs(x - textX) < hitRadius + textConfig.maxWidth / 2 &&
        Math.abs(y - textY) < hitRadius
      ) {
        setIsDragging(true);
        setDragOffset({ x: x - textX, y: y - textY });
      }
    },
    [textConfig, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale - dragOffset.x;
      const y = (e.clientY - rect.top) / scale - dragOffset.y;

      onTextConfigChange({
        ...textConfig,
        x: Math.max(0, Math.min(baseplateSize.width, Math.round(x))),
        y: Math.max(0, Math.min(baseplateSize.height, Math.round(y))),
      });
    },
    [isDragging, dragOffset, scale, baseplateSize, textConfig, onTextConfigChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate text alignment offset for display
  const getTextAlignOffset = () => {
    switch (textConfig.textAlign) {
      case 'left':
        return 0;
      case 'right':
        return textConfig.maxWidth;
      case 'center':
      default:
        return textConfig.maxWidth / 2;
    }
  };

  if (!baseplateUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
        <p className="text-muted-foreground">Upload a template to see preview</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaGVja2VyYm9hcmQpIi8+PC9zdmc+')]"
      style={{
        width: baseplateSize.width * scale,
        height: baseplateSize.height * scale,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Baseplate image */}
      <img
        src={baseplateUrl}
        alt="Template"
        className="absolute inset-0 w-full h-full pointer-events-none"
        draggable={false}
      />

      {/* Draggable text element */}
      <div
        className={`absolute transition-shadow ${
          isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        style={{
          left: (textConfig.x - getTextAlignOffset()) * scale,
          top: textConfig.y * scale,
          width: textConfig.maxWidth * scale,
          cursor: 'grab',
        }}
      >
        {/* Text bounding box */}
        <div
          className="border-2 border-dashed border-green-500 bg-green-500/10 px-2 py-1 hover:bg-green-500/20"
          style={{
            textAlign: textConfig.textAlign,
          }}
        >
          <span
            className="break-words font-bold"
            style={{
              fontFamily: textConfig.fontFamily,
              fontSize: textConfig.fontSize * scale,
              color: textConfig.color,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {sampleText || 'Sample Event Name'}
          </span>
        </div>
        <span className="absolute -top-6 left-0 text-xs bg-green-500 text-white px-1 rounded">
          Text (drag to move)
        </span>
      </div>

      {/* Crosshair guides when dragging */}
      {isDragging && (
        <>
          <div
            className="absolute h-full w-px bg-primary/50 pointer-events-none"
            style={{ left: textConfig.x * scale }}
          />
          <div
            className="absolute w-full h-px bg-primary/50 pointer-events-none"
            style={{ top: textConfig.y * scale }}
          />
        </>
      )}
    </div>
  );
};
