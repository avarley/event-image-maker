

## Overlay Image Management UI

This plan adds a complete interface for uploading, managing, and positioning overlay images on templates. Overlays can be placed either "above" or "below" the event image, allowing for flexible layered compositions.

### What You'll Get

1. **Upload overlays** - An "Add Overlay" button in the template editor to upload PNG images
2. **Visual list** - Each overlay shown with a thumbnail, layer toggle (Above/Below), and delete button
3. **Drag to position** - Overlays appear on the canvas and can be dragged to reposition them
4. **Resize overlays** - Drag corner handles to resize overlays while maintaining proportions
5. **Layer control** - Toggle whether each overlay appears above or below the event image

### UI Preview

The template editor will have a new "Overlays" card section (appearing after the Text Settings card) with:

```text
+--------------------------------------------------+
| Overlays                        [+ Add Overlay]  |
|--------------------------------------------------|
| [thumb] overlay-1.png   [Below v]  [Delete]      |
| [thumb] overlay-2.png   [Above v]  [Delete]      |
+--------------------------------------------------+
```

On the canvas, overlays will be shown with:
- A purple dashed border (to distinguish from the green text box)
- A label showing "Overlay (drag to move)"
- Corner resize handles when hovered

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/TemplateEditor.tsx` | Add overlay management section with upload, list, layer toggle, and delete controls |
| `src/components/TemplateCanvas.tsx` | Add draggable/resizable overlay elements alongside existing text element |

### Implementation Steps

#### 1. Update `TemplateCanvas.tsx`

Add overlay rendering with drag and resize functionality:

- Accept new prop: `overlays: SavedOverlay[]` and `onOverlayChange: (overlays: SavedOverlay[]) => void`
- Track active overlay ID for determining which one is being dragged/resized
- For each overlay:
  - Render the image at scaled position
  - Add purple dashed border with resize handles on corners
  - Handle mouse events for drag-to-move and corner-drag-to-resize
- Resize will maintain aspect ratio by dragging from corners

Key state additions:
```typescript
const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
const [overlayAction, setOverlayAction] = useState<'move' | 'resize' | null>(null);
const [resizeCorner, setResizeCorner] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
```

#### 2. Update `TemplateEditor.tsx`

Add new Overlays section after the Text Settings card:

**New handlers:**
- `handleOverlayUpload` - Read uploaded PNG, create SavedOverlay with default position/size, add to template
- `handleOverlayLayerChange` - Update overlay's layer property ('above' | 'below')
- `handleDeleteOverlay` - Remove overlay from template
- `handleOverlaysChange` - Update overlays array from canvas drag/resize

**New UI section:**
```tsx
<Card>
  <CardContent className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Overlays</span>
      <Button variant="outline" size="sm" asChild>
        <label className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Overlay
          <input type="file" accept="image/png" className="hidden" onChange={handleOverlayUpload} />
        </label>
      </Button>
    </div>
    
    {template.overlays.length > 0 && (
      <div className="space-y-2">
        {template.overlays.map((overlay) => (
          <div key={overlay.id} className="flex items-center gap-3 p-2 border rounded">
            <img src={overlay.dataUrl} className="w-12 h-12 object-contain" />
            <Select value={overlay.layer} onValueChange={(v) => handleOverlayLayerChange(overlay.id, v)}>
              <SelectItem value="below">Below Image</SelectItem>
              <SelectItem value="above">Above Image</SelectItem>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteOverlay(overlay.id)}>
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

### Canvas Interaction Details

**Moving overlays:**
1. Mouse down on overlay → set as active, start move action
2. Mouse move → update overlay x/y based on mouse delta
3. Mouse up → clear active state

**Resizing overlays:**
1. Mouse down on corner handle → set as active, start resize action
2. Mouse move → calculate new width/height maintaining aspect ratio
3. Mouse up → clear active state

Overlays will be rendered in layer order (below overlays first, then above overlays) for accurate visual preview.

### Default Values for New Overlays

When an overlay is uploaded:
- Position: centered on the template (x = width/2 - overlayWidth/2)
- Size: scaled to fit within 30% of template width (maintaining aspect ratio)
- Layer: 'above' (on top of event image by default)

