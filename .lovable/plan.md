

## Show Both Safe Zones Simultaneously

This plan updates the template canvas to display both the 4:5 (portrait) and 5:4 (landscape) safe zone overlays at the same time, so you can see all potential crop areas in one view.

### What You'll See

When the safe zone toggle is enabled, the canvas will show:
- **Left and right edges** highlighted in red - areas cropped when resizing to 4:5 portrait
- **Bottom edge** highlighted in orange - area cropped when resizing to 5:4 landscape

```text
+----+------------------------+----+
|████|                        |████|  <- Red (4:5 side crops)
|████|                        |████|
|████|     SAFE ZONE          |████|
|████|   (Visible in all      |████|
|████|    aspect ratios)      |████|
|████|                        |████|
+----+------------------------+----+
|░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░|  <- Orange (5:4 bottom crop)
+----------------------------------+
```

The overlay will not appear in the final generated images - it's purely a visual guide in the editor.

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/TemplateEditor.tsx` | Add a single "Show Safe Zones" toggle switch (no dropdown needed) |
| `src/components/TemplateCanvas.tsx` | Accept `showSafeZone` prop and render both crop zone overlays simultaneously |

### Implementation Steps

#### 1. Update `TemplateEditor.tsx`

Add local state for the safe zone toggle:

```typescript
const [showSafeZone, setShowSafeZone] = useState(false);
```

Add a simple toggle in the Live Preview card header:

```tsx
<div className="mb-2 flex items-center justify-between">
  <span className="text-sm font-medium">Live Preview</span>
  <div className="flex items-center gap-4">
    {template.baseplateDataUrl && (
      <>
        <div className="flex items-center gap-2">
          <Switch
            id="showSafeZone"
            checked={showSafeZone}
            onCheckedChange={setShowSafeZone}
          />
          <Label htmlFor="showSafeZone" className="text-sm">Show Safe Zones</Label>
        </div>
        <span className="text-xs text-muted-foreground">
          Drag elements to reposition
        </span>
      </>
    )}
  </div>
</div>
```

Pass the prop to TemplateCanvas:

```tsx
<TemplateCanvas
  // ... existing props
  showSafeZone={showSafeZone}
/>
```

#### 2. Update `TemplateCanvas.tsx`

Add `showSafeZone` to the props interface:

```typescript
interface TemplateCanvasProps {
  // ... existing props
  showSafeZone?: boolean;
}
```

Add calculation function for both safe zones:

```typescript
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
```

Add the overlay rendering after the text element but before crosshairs:

```tsx
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
        className="absolute bottom-0 left-0 right-0 bg-orange-500/30 border-t-2 border-dashed border-orange-500 pointer-events-none"
        style={{
          height: safeZoneBounds.bottom * scale,
          // Avoid overlap with side zones
          marginLeft: safeZoneBounds.left * scale,
          marginRight: safeZoneBounds.right * scale,
          width: `calc(100% - ${(safeZoneBounds.left + safeZoneBounds.right) * scale}px)`,
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
```

### Visual Colour Coding

| Zone | Colour | Meaning |
|------|--------|---------|
| Left/Right edges | Red | Cropped in 4:5 portrait |
| Bottom edge | Orange | Cropped in 5:4 landscape |
| Bottom corners | Darker red | Cropped in both orientations |

### Key Points

- **Single toggle** - No dropdown selector, just one switch to show/hide all safe zones
- **Distinct colours** - Red for 4:5 (sides), orange for 5:4 (bottom) makes it easy to understand which crop affects what
- **Preview only** - Uses React DOM overlays that won't appear in the canvas-rendered final images
- **Handles edge cases** - If the template is already narrower than 4:5 or shorter than 5:4, those zones won't render

