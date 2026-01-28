import { useRef, useState, useEffect, useCallback } from 'react';
import { TextConfig, SavedOverlay, DEFAULT_TEXT_FIELDS, FontWeight } from '@/types/imageGenerator';

interface TemplateCanvasProps {
  baseplateUrl: string;
  textConfig: TextConfig;
  textEnabled: boolean;
  sampleText: string;
  overlays: SavedOverlay[];
  onTextConfigChange: (config: TextConfig) => void;
  onOverlaysChange: (overlays: SavedOverlay[]) => void;
  showSafeZone?: boolean;
  showEventImageOverlay?: boolean;
  eventImageAspectRatio?: number; // Width / Height of actual event image
}

type ActionType = 'move' | 'resize' | null;
type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se' | null;

export const TemplateCanvas = ({
  baseplateUrl,
  textConfig,
  textEnabled,
  sampleText,
  overlays,
  onTextConfigChange,
  onOverlaysChange,
  showSafeZone = false,
  showEventImageOverlay = false,
  eventImageAspectRatio,
}: TemplateCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [baseplateSize, setBaseplateSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Overlay interaction state
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [overlayAction, setOverlayAction] = useState<ActionType>(null);
  const [resizeCorner, setResizeCorner] = useState<ResizeCorner>(null);
  const [overlayDragOffset, setOverlayDragOffset] = useState({ x: 0, y: 0 });
  const [initialOverlaySize, setInitialOverlaySize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

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

      // Check if click is near text position (only if text is enabled)
      if (textEnabled) {
        const textX = textConfig.x;
        const textY = textConfig.y;
        const hitRadius = 50;

        if (
          Math.abs(x - textX) < hitRadius + textConfig.maxWidth / 2 &&
          Math.abs(y - textY) < hitRadius
        ) {
          setIsDraggingText(true);
          setDragOffset({ x: x - textX, y: y - textY });
          return;
        }
      }
    },
    [textConfig, scale, textEnabled]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      // Handle text dragging
      if (isDraggingText) {
        const x = mouseX - dragOffset.x;
        const y = mouseY - dragOffset.y;

        onTextConfigChange({
          ...textConfig,
          x: Math.max(0, Math.min(baseplateSize.width, Math.round(x))),
          y: Math.max(0, Math.min(baseplateSize.height, Math.round(y))),
        });
        return;
      }

      // Handle overlay dragging/resizing
      if (activeOverlayId && overlayAction) {
        const overlay = overlays.find((o) => o.id === activeOverlayId);
        if (!overlay) return;

        if (overlayAction === 'move') {
          const newX = mouseX - overlayDragOffset.x;
          const newY = mouseY - overlayDragOffset.y;

          const updatedOverlays = overlays.map((o) =>
            o.id === activeOverlayId
              ? {
                  ...o,
                  x: Math.max(0, Math.min(baseplateSize.width - o.width, Math.round(newX))),
                  y: Math.max(0, Math.min(baseplateSize.height - o.height, Math.round(newY))),
                }
              : o
          );
          onOverlaysChange(updatedOverlays);
        } else if (overlayAction === 'resize' && resizeCorner) {
          const deltaX = mouseX - initialMousePos.x;
          const deltaY = mouseY - initialMousePos.y;
          const aspectRatio = initialOverlaySize.width / initialOverlaySize.height;

          let newWidth = initialOverlaySize.width;
          let newHeight = initialOverlaySize.height;
          let newX = overlay.x;
          let newY = overlay.y;

          // Calculate resize based on corner
          if (resizeCorner === 'se') {
            newWidth = Math.max(50, initialOverlaySize.width + deltaX);
            newHeight = newWidth / aspectRatio;
          } else if (resizeCorner === 'sw') {
            newWidth = Math.max(50, initialOverlaySize.width - deltaX);
            newHeight = newWidth / aspectRatio;
            newX = overlay.x + (initialOverlaySize.width - newWidth);
          } else if (resizeCorner === 'ne') {
            newWidth = Math.max(50, initialOverlaySize.width + deltaX);
            newHeight = newWidth / aspectRatio;
            newY = overlay.y + (initialOverlaySize.height - newHeight);
          } else if (resizeCorner === 'nw') {
            newWidth = Math.max(50, initialOverlaySize.width - deltaX);
            newHeight = newWidth / aspectRatio;
            newX = overlay.x + (initialOverlaySize.width - newWidth);
            newY = overlay.y + (initialOverlaySize.height - newHeight);
          }

          const updatedOverlays = overlays.map((o) =>
            o.id === activeOverlayId
              ? {
                  ...o,
                  x: Math.round(newX),
                  y: Math.round(newY),
                  width: Math.round(newWidth),
                  height: Math.round(newHeight),
                }
              : o
          );
          onOverlaysChange(updatedOverlays);
        }
      }
    },
    [
      isDraggingText,
      dragOffset,
      scale,
      baseplateSize,
      textConfig,
      onTextConfigChange,
      activeOverlayId,
      overlayAction,
      overlayDragOffset,
      resizeCorner,
      initialOverlaySize,
      initialMousePos,
      overlays,
      onOverlaysChange,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingText(false);
    setActiveOverlayId(null);
    setOverlayAction(null);
    setResizeCorner(null);
  }, []);

  const handleOverlayMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string) => {
      e.stopPropagation();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;

      setActiveOverlayId(overlayId);
      setOverlayAction('move');
      setOverlayDragOffset({ x: mouseX - overlay.x, y: mouseY - overlay.y });
    },
    [overlays, scale]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string, corner: ResizeCorner) => {
      e.stopPropagation();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;

      setActiveOverlayId(overlayId);
      setOverlayAction('resize');
      setResizeCorner(corner);
      setInitialMousePos({ x: mouseX, y: mouseY });
      setInitialOverlaySize({ width: overlay.width, height: overlay.height });
    },
    [overlays, scale]
  );

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

  // Calculate safe zone bounds for both 4:5 and 5:4 aspect ratios
  const getSafeZoneBounds = () => {
    const width = baseplateSize.width;
    const height = baseplateSize.height;
    
    // 4:5 Portrait - sides get cropped
    // The visible width becomes height * (4/5)
    const portrait45Width = height * (4 / 5);
    const sideCrop = (width - portrait45Width) / 2;
    
    // 5:4 Landscape - bottom gets cropped
    // The visible height becomes width * (4/5)
    const landscape54Height = width * (4 / 5);
    const bottomCrop = height - landscape54Height;
    
    return {
      left: Math.max(0, sideCrop),
      right: Math.max(0, sideCrop),
      bottom: Math.max(0, bottomCrop),
    };
  };

  const safeZoneBounds = getSafeZoneBounds();

  // Calculate event image bounds (matching useImageGenerator logic)
  const getEventImageBounds = () => {
    const width = baseplateSize.width;
    const height = baseplateSize.height;
    
    // Match the 4:5 safe zone width calculation
    const portrait45Width = height * (4 / 5);
    const safeZoneWidth = Math.min(width, portrait45Width);
    
    // Event image spans 95% of the safe zone width
    const imageWidth = safeZoneWidth * 0.95;
    
    // Use provided aspect ratio, or default to 3:2 (common for event photos)
    const aspectRatio = eventImageAspectRatio || 3 / 2;
    const imageHeight = imageWidth / aspectRatio;
    
    // Center horizontally, positioned 100px above center
    const imageX = (width - imageWidth) / 2;
    const imageY = (height - imageHeight) / 2 - 100;
    
    return {
      x: imageX,
      y: imageY,
      width: imageWidth,
      height: imageHeight,
    };
  };

  const eventImageBounds = getEventImageBounds();

  if (!baseplateUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
        <p className="text-muted-foreground">Upload a template to see preview</p>
      </div>
    );
  }

  // Sort overlays by layer for proper rendering order
  const belowOverlays = overlays.filter((o) => o.layer === 'below');
  const aboveOverlays = overlays.filter((o) => o.layer === 'above');

  const renderOverlay = (overlay: SavedOverlay) => {
    const isActive = activeOverlayId === overlay.id;

    return (
      <div
        key={overlay.id}
        className={`absolute group ${isActive ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
        style={{
          left: overlay.x * scale,
          top: overlay.y * scale,
          width: overlay.width * scale,
          height: overlay.height * scale,
          cursor: overlayAction === 'move' && isActive ? 'grabbing' : 'grab',
        }}
        onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
      >
        <img
          src={overlay.dataUrl}
          alt="Overlay"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
        
        {/* Border and label */}
        <div className="absolute inset-0 border-2 border-dashed border-purple-500 bg-purple-500/10 group-hover:bg-purple-500/20 pointer-events-none" />
        <span className="absolute -top-6 left-0 text-xs bg-purple-500 text-white px-1 rounded whitespace-nowrap">
          Overlay ({overlay.layer})
        </span>

        {/* Resize handles */}
        {['nw', 'ne', 'sw', 'se'].map((corner) => (
          <div
            key={corner}
            className="absolute w-3 h-3 bg-purple-500 border border-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              top: corner.includes('n') ? -6 : undefined,
              bottom: corner.includes('s') ? -6 : undefined,
              left: corner.includes('w') ? -6 : undefined,
              right: corner.includes('e') ? -6 : undefined,
              cursor: `${corner}-resize`,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, overlay.id, corner as ResizeCorner)}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UwZTBlMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaGVja2VyYm9hcmQpIi8+PC9zdmc+')]"
      style={{
        width: baseplateSize.width * scale,
        height: baseplateSize.height * scale,
        cursor: isDraggingText ? 'grabbing' : 'default',
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

      {/* Bottom shadow gradient preview */}
      {textConfig.bottomShadowEnabled && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: baseplateSize.height * scale / 3,
            background: `linear-gradient(to bottom, transparent, rgba(0, 0, 0, ${textConfig.bottomShadowOpacity ?? 0.5}))`,
          }}
        />
      )}

      {/* Overlays BELOW event image layer */}
      {belowOverlays.map(renderOverlay)}

      {/* Event image position overlay - preview only */}
      {showEventImageOverlay && baseplateSize.width > 0 && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none flex items-center justify-center"
          style={{
            left: eventImageBounds.x * scale,
            top: eventImageBounds.y * scale,
            width: eventImageBounds.width * scale,
            height: eventImageBounds.height * scale,
          }}
        >
          <div className="text-blue-500 text-sm font-medium bg-blue-500/20 px-2 py-1 rounded">
            Event Image
          </div>
          <span className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-1 rounded">
            Event Image Position
          </span>
        </div>
      )}

      {/* Overlays ABOVE event image layer */}
      {aboveOverlays.map(renderOverlay)}

      {/* Draggable text element - only show if text is enabled */}
      {textEnabled && (
        <div
          className={`absolute transition-shadow ${
            isDraggingText ? 'ring-2 ring-primary ring-offset-2' : ''
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
            {(sampleText || 'Sample Event Name').split('\n').map((lineText, index) => {
              const fields = textConfig.fields || DEFAULT_TEXT_FIELDS;
              // Apply uppercase to first line (event name) if enabled
              const line = index === 0 && fields.eventNameUppercase ? lineText.toUpperCase() : lineText;
              const fontSize = index === 0 && textConfig.eventNameFontSize 
                ? textConfig.eventNameFontSize 
                : textConfig.fontSize;
              
              // Determine font weight based on which line this is
              let fontWeight: FontWeight = '700';
              if (index === 0 && fields.showEventName) {
                fontWeight = fields.eventNameFontWeight || '700';
              } else if (index === 1 && fields.showDate) {
                fontWeight = fields.dateFontWeight || '700';
              } else if (index >= 1) {
                // Venue/Location line
                fontWeight = fields.venueLocationFontWeight || '700';
              }
              
              return (
                <div
                  key={index}
                  style={{
                    fontFamily: textConfig.fontFamily,
                    fontSize: fontSize * scale,
                    fontWeight: parseInt(fontWeight),
                    color: textConfig.color,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: 1.2,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
          <span className="absolute -top-6 left-0 text-xs bg-green-500 text-white px-1 rounded">
            Text (drag to move)
          </span>
        </div>
      )}

      {/* Safe zone overlays - preview only, not in final output */}
      {showSafeZone && baseplateSize.width > 0 && (
        <>
          {/* 4:5 Portrait - Left crop zone */}
          {safeZoneBounds.left > 0 && (
            <div
              className="absolute top-0 left-0 bg-red-500/30 border-r-2 border-dashed border-red-500 pointer-events-none"
              style={{
                width: safeZoneBounds.left * scale,
                height: baseplateSize.height * scale,
              }}
            >
              <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-1 rounded">
                4:5 crop
              </span>
            </div>
          )}
          
          {/* 4:5 Portrait - Right crop zone */}
          {safeZoneBounds.right > 0 && (
            <div
              className="absolute top-0 right-0 bg-red-500/30 border-l-2 border-dashed border-red-500 pointer-events-none"
              style={{
                width: safeZoneBounds.right * scale,
                height: baseplateSize.height * scale,
              }}
            />
          )}
          
          {/* 5:4 Landscape - Bottom crop zone */}
          {safeZoneBounds.bottom > 0 && (
            <div
              className="absolute bottom-0 bg-orange-500/30 border-t-2 border-dashed border-orange-500 pointer-events-none"
              style={{
                height: safeZoneBounds.bottom * scale,
                left: safeZoneBounds.left * scale,
                right: safeZoneBounds.right * scale,
              }}
            >
              <span className="absolute top-2 left-2 text-xs bg-orange-500 text-white px-1 rounded">
                5:4 crop
              </span>
            </div>
          )}
          
          {/* Corner indicator for overlapping danger zone */}
          {safeZoneBounds.left > 0 && safeZoneBounds.bottom > 0 && (
            <>
              <div
                className="absolute bg-red-600/40 pointer-events-none"
                style={{
                  left: 0,
                  bottom: 0,
                  width: safeZoneBounds.left * scale,
                  height: safeZoneBounds.bottom * scale,
                }}
              />
              <div
                className="absolute bg-red-600/40 pointer-events-none"
                style={{
                  right: 0,
                  bottom: 0,
                  width: safeZoneBounds.right * scale,
                  height: safeZoneBounds.bottom * scale,
                }}
              />
            </>
          )}
        </>
      )}

      {/* Crosshair guides when dragging text */}
      {isDraggingText && textEnabled && (
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
