

## Two New Features: Bottom Shadow Gradient & Event Name Font Size

This plan adds two features to improve text visibility and allow different text sizing for the event name.

### Feature 1: Bottom Shadow Gradient

A semi-transparent black gradient on the bottom third of the image that makes text more readable. This is applied as the **first layer above the template baseplate** in the rendering order.

**Visual effect:**
```text
+----------------------------------+
|                                  |
|          EVENT IMAGE             |
|                                  |
|                                  |
|░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░|  <- Gradient starts (transparent)
|▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|
|██████████████████████████████████|  <- Bottom (solid black ~50% opacity)
|       EVENT NAME TEXT            |
+----------------------------------+
```

### Feature 2: Separate Event Name Font Size

Allow the event name to have a different (typically larger) font size than the other text fields (date, venue, location).

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/imageGenerator.ts` | Add `bottomShadowEnabled` to `TextConfig` and `eventNameFontSize` for separate sizing |
| `src/components/TemplateEditor.tsx` | Add UI toggle for bottom shadow and input for event name font size |
| `src/components/TemplateCanvas.tsx` | Render gradient preview in editor |
| `src/hooks/useImageGenerator.ts` | Draw gradient in final output and use separate font size for event name |

### Implementation Steps

#### 1. Update Types (`src/types/imageGenerator.ts`)

Add new properties to `TextConfig`:

```typescript
export interface TextConfig {
  fontFamily: string;
  fontSize: number;
  eventNameFontSize?: number; // NEW - separate size for event name
  color: string;
  x: number;
  y: number;
  maxWidth: number;
  textAlign: CanvasTextAlign;
  fields: TextFieldConfig;
  bottomShadowEnabled?: boolean; // NEW - toggle for gradient
  bottomShadowOpacity?: number;  // NEW - customise opacity (0-1)
}
```

#### 2. Update TemplateEditor (`src/components/TemplateEditor.tsx`)

Add UI controls in the "Text Settings" section:

**Bottom Shadow Toggle:**
```tsx
<div className="flex items-center gap-2">
  <Switch
    id="bottomShadow"
    checked={template.textConfig.bottomShadowEnabled ?? false}
    onCheckedChange={(checked) => handleTextFieldChange('bottomShadowEnabled', checked)}
  />
  <Label htmlFor="bottomShadow" className="text-sm">Bottom Shadow</Label>
</div>
```

**Event Name Font Size Input** (shown when Event Name is enabled):
```tsx
{textFields.showEventName && (
  <div className="space-y-2">
    <Label htmlFor="eventNameFontSize">Event Name Size (px)</Label>
    <Input
      id="eventNameFontSize"
      type="number"
      min={12}
      max={200}
      value={template.textConfig.eventNameFontSize ?? template.textConfig.fontSize}
      onChange={(e) => handleTextFieldChange('eventNameFontSize', parseInt(e.target.value) || 56)}
    />
  </div>
)}
```

Update the default config to include new fields:

```typescript
const DEFAULT_TEXT_CONFIG: TextConfig = {
  // ... existing fields
  eventNameFontSize: 56,
  bottomShadowEnabled: false,
  bottomShadowOpacity: 0.5,
};
```

#### 3. Update TemplateCanvas (`src/components/TemplateCanvas.tsx`)

Add a preview of the bottom shadow gradient (visual only, matches final output):

```tsx
{/* Bottom shadow gradient preview */}
{template.textConfig.bottomShadowEnabled && (
  <div
    className="absolute bottom-0 left-0 right-0 pointer-events-none"
    style={{
      height: baseplateSize.height * scale / 3,
      background: `linear-gradient(to bottom, transparent, rgba(0, 0, 0, ${template.textConfig.bottomShadowOpacity ?? 0.5}))`,
    }}
  />
)}
```

This will be rendered after the baseplate but before overlays in the DOM order, matching the layering in the final output.

#### 4. Update useImageGenerator (`src/hooks/useImageGenerator.ts`)

**Draw the gradient after baseplate, before everything else:**

```typescript
// Draw baseplate first (background)
ctx.drawImage(template.baseplate, 0, 0);

// Draw bottom shadow gradient (if enabled)
if (template.textConfig.bottomShadowEnabled) {
  const gradientHeight = canvasHeight / 3;
  const gradient = ctx.createLinearGradient(
    0, canvasHeight - gradientHeight,
    0, canvasHeight
  );
  const opacity = template.textConfig.bottomShadowOpacity ?? 0.5;
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvasHeight - gradientHeight, canvasWidth, gradientHeight);
}

// Then continue with overlays, event image, text...
```

**Use separate font size for event name:**

Update the text drawing section to check if the current line is the event name:

```typescript
const fields = textConfig.fields || DEFAULT_TEXT_FIELDS;
const textLines = buildTextLines(event, fields);

let currentY = textConfig.y;
let isFirstLine = true;

for (const lineText of textLines) {
  // Use event name font size for first line if it's the event name
  const currentFontSize = (isFirstLine && fields.showEventName && textConfig.eventNameFontSize)
    ? textConfig.eventNameFontSize
    : textConfig.fontSize;
  
  ctx.font = `bold ${currentFontSize}px ${textConfig.fontFamily}`;
  const lineHeight = currentFontSize * 1.2;
  
  // ... word wrapping logic
  
  isFirstLine = false;
  currentY += lineHeight;
}
```

### Layer Order (Final Output)

1. **Baseplate** (background template)
2. **Bottom shadow gradient** (NEW - first layer above baseplate)
3. **"Below" overlays**
4. **Event image**
5. **"Above" overlays**
6. **Text**

### UI Preview

The editor will show:
- A toggle switch for "Bottom Shadow" alongside the existing text settings
- A slider or input for shadow opacity (optional, can default to 50%)
- A new "Event Name Size" input that appears when Event Name is enabled
- Live preview of the gradient in the canvas

### Defaults

| Setting | Default Value |
|---------|---------------|
| Bottom Shadow | Off |
| Shadow Opacity | 0.5 (50%) |
| Event Name Font Size | Same as main font size (56px) |

