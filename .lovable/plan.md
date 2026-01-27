
## Fix Event Image Preview Overlay Size

The event image preview in the template editor shows the wrong size because it uses a hardcoded 16:9 aspect ratio, while actual event images often have different ratios (e.g., 3:2). This causes a mismatch between what you see in the editor and what gets generated.

### The Problem

| Setting | Preview Overlay | Actual Generation |
|---------|-----------------|-------------------|
| Width calculation | Same (95% of safe zone) | Same |
| Height calculation | Assumes 16:9 ratio | Uses real image ratio |
| Result | Shows smaller box | Image is taller, touches text |

The G Flip image is 2560x1707 pixels (~3:2 ratio), making it significantly taller than a 16:9 image of the same width.

### The Solution

Instead of using a fixed 16:9 aspect ratio for the preview, use the actual aspect ratio of a selected event's image. If no event is selected, fall back to a more representative ratio like 3:2 (which is common for event photos).

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/TemplateCanvas.tsx` | Accept optional `eventImageAspectRatio` prop |
| `src/components/TemplateEditor.tsx` | Pass the selected event's image aspect ratio down to the canvas |
| `src/pages/Index.tsx` | Compute and pass the first selected event's image aspect ratio to the editor |

---

## Technical Details

### 1. Update `TemplateCanvas.tsx`

Add an optional prop for the event image aspect ratio:

```typescript
interface TemplateCanvasProps {
  // ... existing props
  eventImageAspectRatio?: number; // Width / Height of actual event image
}
```

Update `getEventImageBounds()` to use this prop:

```typescript
const getEventImageBounds = () => {
  const width = baseplateSize.width;
  const height = baseplateSize.height;
  
  const portrait45Width = height * (4 / 5);
  const safeZoneWidth = Math.min(width, portrait45Width);
  
  const imageWidth = safeZoneWidth * 0.95;
  
  // Use provided aspect ratio, or default to 3:2 (common for event photos)
  const aspectRatio = eventImageAspectRatio || 3 / 2;
  const imageHeight = imageWidth / aspectRatio;
  
  const imageX = (width - imageWidth) / 2;
  const imageY = (height - imageHeight) / 2 - 100;
  
  return { x: imageX, y: imageY, width: imageWidth, height: imageHeight };
};
```

### 2. Update `TemplateEditor.tsx`

Accept and pass through the aspect ratio prop:

```typescript
interface TemplateEditorProps {
  // ... existing props
  eventImageAspectRatio?: number;
}

// Pass to TemplateCanvas
<TemplateCanvas
  // ... existing props
  eventImageAspectRatio={eventImageAspectRatio}
/>
```

### 3. Update `Index.tsx`

Compute the aspect ratio from the first selected event's image:

```typescript
// Compute event image aspect ratio for preview
const [eventImageAspectRatio, setEventImageAspectRatio] = useState<number | undefined>();

// When selected events change, load first event's image to get aspect ratio
useEffect(() => {
  const firstSelectedEvent = events.find((e) => selectedEventIds.has(e.EVENT_ID));
  if (firstSelectedEvent) {
    const img = new Image();
    img.onload = () => {
      setEventImageAspectRatio(img.width / img.height);
    };
    // Use custom image if overridden, otherwise the large URL
    const imageUrl = imageOverrides[firstSelectedEvent.EVENT_ID] 
      || firstSelectedEvent.EVENT_IMAGE_LARGE_URL;
    img.src = imageUrl.startsWith('http') 
      ? `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`
      : imageUrl;
  } else {
    setEventImageAspectRatio(undefined);
  }
}, [events, selectedEventIds, imageOverrides]);

// Pass to TemplateEditor
<TemplateEditor
  // ... existing props
  eventImageAspectRatio={eventImageAspectRatio}
/>
```

### Why 3:2 as Default?

- 16:9 (1.78:1) is common for video thumbnails but makes images look shorter
- 3:2 (1.5:1) is more common for event photography and album art
- Using 3:2 gives a more accurate preview when no event is selected
