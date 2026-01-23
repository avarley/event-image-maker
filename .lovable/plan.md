

# Remove Transparent Region Requirement - Center Event Images

## Overview
This update simplifies the template system by removing the transparent region detection. Instead of detecting and placing images in transparent areas, event images will be centered within the full template frame.

## What Will Change

### For You (User Experience)
- Upload any image as a template (no need for transparent areas)
- Event images automatically center in the template
- Simpler setup - no more "transparent region detected" messages
- Templates are valid as soon as you upload an image

### New Layering Order
Currently: Event Image (in transparent area) → Baseplate → Text

New: Event Image (centered, full frame) → Baseplate (overlays on top) → Text

---

## Technical Changes

### 1. Update Type Definitions
**File: `src/types/imageGenerator.ts`**
- Remove `transparentRegion` field from `SavedTemplate` interface
- Remove `transparentRegion` field from `TemplateConfig` interface
- Keep `TransparentRegion` type for backward compatibility during migration

### 2. Simplify Image Generator
**File: `src/hooks/useImageGenerator.ts`**
- Remove the check for `transparentRegion`
- Change image placement logic to:
  - Draw event image centered in the canvas (covering full frame with aspect ratio maintained)
  - Draw baseplate on top
  - Draw overlays and text

```text
New generation flow:
+-------------------+
|                   |
|   Event Image     |  ← Centered, scaled to cover
|   (background)    |
|                   |
+-------------------+
        ↓
+-------------------+
|    Baseplate      |  ← Drawn on top
|    (overlay)      |
+-------------------+
        ↓
+-------------------+
|    Text Layer     |  ← Dynamic event name
+-------------------+
```

### 3. Remove Transparency Detection Hook
**File: `src/hooks/useTransparencyDetection.ts`**
- This file can be deleted entirely (no longer needed)

### 4. Update Template Editor
**File: `src/components/TemplateEditor.tsx`**
- Remove import and usage of `useTransparencyDetection`
- Remove `transparentRegion` from template updates
- Remove toast messages about transparent region detection
- Remove the "Image Area" hint from the canvas preview

### 5. Update Template Canvas
**File: `src/components/TemplateCanvas.tsx`**
- Remove `transparentRegion` prop
- Remove the blue dashed "Image Area" indicator
- Keep the text drag-and-drop functionality unchanged

### 6. Update Index Page
**File: `src/pages/Index.tsx`**
- Remove the `transparentRegion` check when filtering valid templates
- Remove the `transparentRegion` check before generating images
- Update help text from "transparent region" to general template requirements

### 7. Remove Unused Component
**File: `src/components/TemplateUpload.tsx`**
- This file can be deleted (transparency detection UI no longer needed)

---

## Files to Modify
| File | Action |
|------|--------|
| `src/types/imageGenerator.ts` | Remove `transparentRegion` from interfaces |
| `src/hooks/useImageGenerator.ts` | Update to center images instead of using region |
| `src/hooks/useTransparencyDetection.ts` | Delete file |
| `src/components/TemplateEditor.tsx` | Remove transparency detection logic |
| `src/components/TemplateCanvas.tsx` | Remove transparent region indicator |
| `src/components/TemplateUpload.tsx` | Delete file |
| `src/pages/Index.tsx` | Remove transparent region validation |

---

## Backward Compatibility
Existing saved templates in localStorage will still work. The `transparentRegion` field will simply be ignored if present.

