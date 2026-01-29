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

type ActionType = 'move' | 'resize' | 'rotate' | null;
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
  const [initialRotation, setInitialRotation] = useState(0);
  
  // Event image frame dragging state
  const [isDraggingEventFrame, setIsDraggingEventFrame] = useState(false);
  const [eventFrameDragStart, setEventFrameDragStart] = useState({ x: 0, y: 0 });
  
  // Snapping state for text
  const [snappedToX, setSnappedToX] = useState(false);
  const [snappedToY, setSnappedToY] = useState(false);
  // Snapping state for event frame
  const [eventFrameSnappedX, setEventFrameSnappedX] = useState(false);
  const [eventFrameSnappedY, setEventFrameSnappedY] = useState(false);
  const SNAP_THRESHOLD = 10; // pixels

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

      // Handle event frame dragging
      if (isDraggingEventFrame) {
        const deltaX = mouseX - eventFrameDragStart.x;
        const deltaY = mouseY - eventFrameDragStart.y;
        
        // Get current frame dimensions
        const frameWidthPercent = textConfig.eventImageWidth ?? 80;
        const frameHeightPercent = textConfig.eventImageHeight ?? 50;
        const frameWidth = baseplateSize.width * (frameWidthPercent / 100);
        const frameHeight = baseplateSize.height * (frameHeightPercent / 100);
        
        // Convert delta to percentage change
        const maxXRange = baseplateSize.width - frameWidth;
        const maxYRange = baseplateSize.height - frameHeight;
        
        const currentXPercent = textConfig.eventImageX ?? 50;
        const currentYPercent = textConfig.eventImageY ?? 30;
        
        // Calculate new position as percentage
        let newXPercent = currentXPercent + (deltaX / maxXRange) * 100;
        let newYPercent = currentYPercent + (deltaY / maxYRange) * 100;
        
        // Clamp to 0-100
        newXPercent = Math.max(0, Math.min(100, newXPercent));
        newYPercent = Math.max(0, Math.min(100, newYPercent));
        
        // Snap to center (50%) with threshold
        const snapThresholdPercent = (SNAP_THRESHOLD / maxXRange) * 100;
        const snapThresholdPercentY = (SNAP_THRESHOLD / maxYRange) * 100;
        
        if (Math.abs(newXPercent - 50) < Math.max(2, snapThresholdPercent)) {
          newXPercent = 50;
          setEventFrameSnappedX(true);
        } else {
          setEventFrameSnappedX(false);
        }
        
        if (Math.abs(newYPercent - 50) < Math.max(2, snapThresholdPercentY)) {
          newYPercent = 50;
          setEventFrameSnappedY(true);
        } else {
          setEventFrameSnappedY(false);
        }
        
        onTextConfigChange({
          ...textConfig,
          eventImageX: Math.round(newXPercent),
          eventImageY: Math.round(newYPercent),
        });
        
        setEventFrameDragStart({ x: mouseX, y: mouseY });
        return;
      }

      // Handle text dragging
      if (isDraggingText) {
        let x = mouseX - dragOffset.x;
        let y = mouseY - dragOffset.y;
        
        // Calculate center points
        const centerX = baseplateSize.width / 2;
        const centerY = baseplateSize.height / 2;
        
        // Snap to center X
        if (Math.abs(x - centerX) < SNAP_THRESHOLD) {
          x = centerX;
          setSnappedToX(true);
        } else {
          setSnappedToX(false);
        }
        
        // Snap to center Y
        if (Math.abs(y - centerY) < SNAP_THRESHOLD) {
          y = centerY;
          setSnappedToY(true);
        } else {
          setSnappedToY(false);
        }

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
                  x: Math.round(newX),
                  y: Math.round(newY),
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

          // Clamp position to keep overlay visible on canvas (at least 50px visible)
          const minVisible = 50;
          newX = Math.max(-newWidth + minVisible, Math.min(baseplateSize.width - minVisible, newX));
          newY = Math.max(-newHeight + minVisible, Math.min(baseplateSize.height - minVisible, newY));

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
        } else if (overlayAction === 'rotate') {
          // Calculate angle from overlay center to mouse position
          const centerX = overlay.x + overlay.width / 2;
          const centerY = overlay.y + overlay.height / 2;
          
          const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
          const angleDeg = (angle * 180 / Math.PI) + 90; // Offset so 0 is up
          
          // Snap to 15-degree increments when close
          const snapAngle = 15;
          const snappedAngle = Math.round(angleDeg / snapAngle) * snapAngle;
          const finalAngle = Math.abs(angleDeg - snappedAngle) < 5 ? snappedAngle : angleDeg;
          
          // Normalize to 0-360
          const normalizedAngle = ((finalAngle % 360) + 360) % 360;
          
          const updatedOverlays = overlays.map((o) =>
            o.id === activeOverlayId
              ? { ...o, rotation: Math.round(normalizedAngle) }
              : o
          );
          onOverlaysChange(updatedOverlays);
        }
      }
    },
    [
      isDraggingText,
      isDraggingEventFrame,
      eventFrameDragStart,
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
    setSnappedToX(false);
    setSnappedToY(false);
    setEventFrameSnappedX(false);
    setEventFrameSnappedY(false);
    setIsDraggingEventFrame(false);
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

  const handleRotateMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string) => {
      e.stopPropagation();
      if (!containerRef.current) return;

      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;

      setActiveOverlayId(overlayId);
      setOverlayAction('rotate');
      setInitialRotation(overlay.rotation || 0);
    },
    [overlays]
  );

  // Event frame drag handler
  const handleEventFrameMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      
      setIsDraggingEventFrame(true);
      setEventFrameDragStart({ x: mouseX, y: mouseY });
    },
    [scale]
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
      top: 0,
      bottom: Math.max(0, bottomCrop),
    };
  };

  const safeZoneBounds = getSafeZoneBounds();

  // Calculate event image frame bounds
  const getEventImageBounds = () => {
    const canvasWidth = baseplateSize.width;
    const canvasHeight = baseplateSize.height;
    
    // Get frame settings from config
    const frameWidthPercent = textConfig.eventImageWidth ?? 80;
    const frameHeightPercent = textConfig.eventImageHeight ?? 50;
    const xPercent = textConfig.eventImageX ?? 50;
    const yPercent = textConfig.eventImageY ?? 30;
    
    // Calculate frame dimensions
    const frameWidth = canvasWidth * (frameWidthPercent / 100);
    const frameHeight = canvasHeight * (frameHeightPercent / 100);
    
    // Calculate frame position (percentage-based, 50 = centered)
    const frameX = (canvasWidth - frameWidth) * (xPercent / 100);
    const frameY = (canvasHeight - frameHeight) * (yPercent / 100);
    
    return {
      x: frameX,
      y: frameY,
      width: frameWidth,
      height: frameHeight,
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

  const renderOverlay = (overlay: SavedOverlay, index: number) => {
    const isActive = activeOverlayId === overlay.id;
    const rotation = overlay.rotation || 0;

    return (
      <div
        key={overlay.id}
        className={`absolute group`}
        style={{
          left: overlay.x * scale,
          top: overlay.y * scale,
          width: overlay.width * scale,
          height: overlay.height * scale,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          cursor: overlayAction === 'move' && isActive ? 'grabbing' : 'grab',
          zIndex: isActive ? 100 : 50 + index,
        }}
        onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
      >
        <img
          src={overlay.dataUrl}
          alt="Overlay"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
          style={{
            transform: `scaleX(${overlay.flipHorizontal ? -1 : 1}) scaleY(${overlay.flipVertical ? -1 : 1})`,
          }}
        />
        
        {/* Border and label */}
        <div className={`absolute inset-0 border-2 border-dashed border-purple-500 bg-purple-500/10 group-hover:bg-purple-500/20 pointer-events-none ${isActive ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`} />
        <span 
          className="absolute -top-6 left-0 text-xs bg-purple-500 text-white px-1 rounded whitespace-nowrap"
          style={{ transform: `rotate(-${rotation}deg)`, transformOrigin: 'left center' }}
        >
          {overlay.name} ({rotation}°)
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

        {/* Rotation handle - circular handle above the overlay */}
        <div
          className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center"
          style={{ top: -32 }}
        >
          <div className="w-px h-4 bg-purple-500" />
          <div
            className="w-4 h-4 bg-purple-500 border-2 border-white rounded-full cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
            onMouseDown={(e) => handleRotateMouseDown(e, overlay.id)}
            title="Drag to rotate"
          />
        </div>
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
      {/* Baseplate image as background layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${baseplateUrl})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Center guidelines - visible when dragging text */}
      {isDraggingText && baseplateSize.width > 0 && (
        <>
          {/* Vertical center line */}
          <div
            className={`absolute top-0 bottom-0 w-px pointer-events-none transition-colors ${
              snappedToX ? 'bg-yellow-400' : 'bg-yellow-400/50'
            }`}
            style={{
              left: (baseplateSize.width / 2) * scale,
              zIndex: 200,
            }}
          />
          {/* Horizontal center line */}
          <div
            className={`absolute left-0 right-0 h-px pointer-events-none transition-colors ${
              snappedToY ? 'bg-yellow-400' : 'bg-yellow-400/50'
            }`}
            style={{
              top: (baseplateSize.height / 2) * scale,
              zIndex: 200,
            }}
          />
        </>
      )}

      {/* Center guidelines - visible when dragging event frame */}
      {isDraggingEventFrame && baseplateSize.width > 0 && (
        <>
          {/* Vertical center line */}
          <div
            className={`absolute top-0 bottom-0 w-px pointer-events-none transition-colors ${
              eventFrameSnappedX ? 'bg-cyan-400' : 'bg-cyan-400/50'
            }`}
            style={{
              left: (baseplateSize.width / 2) * scale,
              zIndex: 200,
            }}
          />
          {/* Horizontal center line */}
          <div
            className={`absolute left-0 right-0 h-px pointer-events-none transition-colors ${
              eventFrameSnappedY ? 'bg-cyan-400' : 'bg-cyan-400/50'
            }`}
            style={{
              top: (baseplateSize.height / 2) * scale,
              zIndex: 200,
            }}
          />
        </>
      )}

      {/* Bottom shadow gradient preview */}
      {textConfig.bottomShadowEnabled && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: baseplateSize.height * scale * ((textConfig.bottomShadowHeight ?? 33) / 100),
            background: `linear-gradient(to bottom, transparent, rgba(0, 0, 0, ${textConfig.bottomShadowOpacity ?? 0.5}))`,
            zIndex: 5,
          }}
        />
      )}

      {/* Event image frame preview - draggable */}
      {showEventImageOverlay && baseplateSize.width > 0 && (
        <div
          className={`absolute border-2 border-dashed border-blue-500 bg-blue-500/20 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-blue-500/30 transition-colors ${
            isDraggingEventFrame ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
          style={{
            left: eventImageBounds.x * scale,
            top: eventImageBounds.y * scale,
            width: eventImageBounds.width * scale,
            height: eventImageBounds.height * scale,
            borderRadius: (textConfig.eventImageBorderRadius ?? 0) * scale,
            zIndex: 10,
          }}
          onMouseDown={handleEventFrameMouseDown}
        >
          <div className="text-blue-500 text-sm font-medium bg-white/80 px-2 py-1 rounded pointer-events-none">
            Event Image Frame (drag to move)
          </div>
        </div>
      )}

      {/* All overlays rendered ABOVE event image */}
      {belowOverlays.map((overlay, index) => renderOverlay(overlay, index))}
      {aboveOverlays.map((overlay, index) => renderOverlay(overlay, belowOverlays.length + index))}

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
            zIndex: 150,
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
              
              // Determine font weight, family, and letter spacing based on which line this is
              let fontWeight: FontWeight = '700';
              let fontFamily: string = textConfig.fontFamily;
              let letterSpacing: number = 0;
              
              if (index === 0 && fields.showEventName) {
                fontWeight = fields.eventNameFontWeight || '700';
                fontFamily = fields.eventNameFontFamily || textConfig.fontFamily;
                letterSpacing = fields.eventNameLetterSpacing ?? 0;
              } else if (index === 1 && fields.showDate) {
                fontWeight = fields.dateFontWeight || '700';
                fontFamily = fields.dateFontFamily || textConfig.fontFamily;
                letterSpacing = fields.dateLetterSpacing ?? 0;
              } else if (index >= 1) {
                // Venue/Location line
                fontWeight = fields.venueLocationFontWeight || '700';
                fontFamily = fields.venueLocationFontFamily || textConfig.fontFamily;
                letterSpacing = fields.venueLocationLetterSpacing ?? 0;
              }
              
              return (
                <div
                  key={index}
                  style={{
                    fontFamily: fontFamily,
                    fontSize: fontSize * scale,
                    fontWeight: parseInt(fontWeight),
                    color: textConfig.color,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: textConfig.lineHeight ?? 1.2,
                    letterSpacing: `${letterSpacing}px`,
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
          
          {/* 5:4 Landscape - Top crop zone */}
          {safeZoneBounds.top > 0 && (
            <div
              className="absolute top-0 bg-orange-500/30 border-b-2 border-dashed border-orange-500 pointer-events-none"
              style={{
                height: safeZoneBounds.top * scale,
                left: safeZoneBounds.left * scale,
                right: safeZoneBounds.right * scale,
              }}
            >
              <span className="absolute bottom-2 left-2 text-xs bg-orange-500 text-white px-1 rounded">
                5:4 crop
              </span>
            </div>
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
            />
          )}
          
          {/* Corner indicators for overlapping danger zones */}
          {safeZoneBounds.left > 0 && (safeZoneBounds.top > 0 || safeZoneBounds.bottom > 0) && (
            <>
              {/* Top-left corner */}
              {safeZoneBounds.top > 0 && (
                <div
                  className="absolute bg-red-600/40 pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: safeZoneBounds.left * scale,
                    height: safeZoneBounds.top * scale,
                  }}
                />
              )}
              {/* Top-right corner */}
              {safeZoneBounds.top > 0 && (
                <div
                  className="absolute bg-red-600/40 pointer-events-none"
                  style={{
                    right: 0,
                    top: 0,
                    width: safeZoneBounds.right * scale,
                    height: safeZoneBounds.top * scale,
                  }}
                />
              )}
              {/* Bottom-left corner */}
              {safeZoneBounds.bottom > 0 && (
                <div
                  className="absolute bg-red-600/40 pointer-events-none"
                  style={{
                    left: 0,
                    bottom: 0,
                    width: safeZoneBounds.left * scale,
                    height: safeZoneBounds.bottom * scale,
                  }}
                />
              )}
              {/* Bottom-right corner */}
              {safeZoneBounds.bottom > 0 && (
                <div
                  className="absolute bg-red-600/40 pointer-events-none"
                  style={{
                    right: 0,
                    bottom: 0,
                    width: safeZoneBounds.right * scale,
                    height: safeZoneBounds.bottom * scale,
                  }}
                />
              )}
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
