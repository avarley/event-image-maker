

## Rebuild Bulk Image Generator Application

This plan covers rebuilding the complete Bulk Image Generator application as a new Lovable app, including a single-page documentation view that explains the architecture and key decisions.

### Application Overview

The Bulk Image Generator is a client-side web application that creates promotional images by combining template images with event data from a JSON feed. It uses the HTML5 Canvas API for image compositing and localStorage for template persistence.

### Architecture Summary

```text
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  Event Data      | --> |  Template Editor  | --> |  Image Generator |
|  (JSON Feed)     |     |  (Canvas Preview) |     |  (Canvas API)    |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
|  Event Selector  |     |  Template Storage |     |  Generated PNG   |
|  + Image Cropper |     |  (localStorage)   |     |  Downloads       |
+------------------+     +-------------------+     +------------------+
```

### File Structure to Create

| File | Purpose |
|------|---------|
| `src/types/imageGenerator.ts` | TypeScript interfaces for all data structures |
| `src/hooks/useImageGenerator.ts` | Canvas-based image generation logic |
| `src/hooks/useTemplateStorage.ts` | localStorage persistence for templates |
| `src/components/TemplateCanvas.tsx` | Interactive canvas preview with drag-and-drop |
| `src/components/TemplateEditor.tsx` | Main editing UI with text/overlay controls |
| `src/components/TemplateList.tsx` | Sidebar list of saved templates |
| `src/components/EventSelector.tsx` | Event feed loader and selection UI |
| `src/components/ImageCropModal.tsx` | 3:2 aspect ratio image cropper |
| `src/components/ImagePreview.tsx` | Generated images grid with download |
| `src/pages/Index.tsx` | Main application page with 3-step workflow |
| `src/pages/Documentation.tsx` | **New:** Single-page documentation view |

### Implementation Steps

#### Phase 1: Core Types and Utilities

Create the type definitions that power the entire application:

- `EventData` - Structure matching the JSON feed (EVENT_ID, EVENT_NAME, EVENT_IMAGE_LARGE_URL, etc.)
- `TextConfig` - Font settings, position, alignment, field visibility toggles
- `TextFieldConfig` - Controls which fields display (event name, date, venue, location)
- `SavedTemplate` - Complete template state including baseplate, overlays, text config
- `OverlayConfig` - Overlay image positioning and layer ordering (above/below event image)
- `GeneratedImage` - Output structure with data URL and metadata

#### Phase 2: Template Storage Hook

Implement `useTemplateStorage` with:

- localStorage persistence with key `bulk-image-generator-templates`
- CRUD operations: create, update, delete, duplicate templates
- Migration logic for older template versions missing new fields
- Active template selection state

#### Phase 3: Image Generation Hook

Implement `useImageGenerator` with:

- `loadImage()` - Load images with CORS proxy for external URLs
- `formatDate()` - Multiple formats (short/long/full) with ordinal and uppercase options
- `formatLocation()` - City, city-state, or city-country formats
- `buildTextLines()` - Construct text array from enabled fields
- `generateImage()` - Main canvas compositing function

The generation pipeline draws layers in order:
1. Baseplate (template background)
2. Bottom shadow gradient (if enabled)
3. Below-layer overlays
4. Event image (centered, 95% of 4:5 safe zone width)
5. Above-layer overlays
6. Text with word wrapping

#### Phase 4: Template Canvas Component

Interactive preview component with:

- Scaled display to fit container while preserving aspect ratio
- Drag-to-reposition for text element
- Drag-to-move and resize handles for overlay images
- Safe zone visualization (4:5 portrait and 5:4 landscape crop guides)
- Event image position preview overlay
- Bottom shadow gradient preview

#### Phase 5: Template Editor Component

Full editing interface including:

- Template image upload with auto-centering
- Overlay management (add, delete, change layer)
- Text settings panel:
  - Field toggles (event name, date, venue, location)
  - Date format with ordinal/uppercase options
  - Location format selector
  - Font family, size, color, alignment
  - X/Y position and max width
  - Separate event name font size
- Bottom shadow gradient toggle with opacity slider
- Reset to defaults button

#### Phase 6: Event Selector Component

Event data management:

- JSON feed URL input with fetch button
- CORS proxy integration (`corsproxy.io`)
- Checkbox selection with select/deselect all
- Custom image upload per event with crop modal
- Override indicator for customized images

#### Phase 7: Image Crop Modal

Aspect-ratio-locked cropping:

- 3:2 aspect ratio constraint (common for event photos)
- Visual overlay showing excluded regions
- Rule-of-thirds grid lines
- Corner resize handle maintaining aspect ratio
- Canvas-based crop extraction

#### Phase 8: Main Page with 3-Step Workflow

Tab-based interface:

1. **Templates** - Split view with template list sidebar + editor
2. **Events** - Event selector with custom image overrides
3. **Generate** - Template selection grid, summary, generate button, results

#### Phase 9: Documentation Page (New)

Create a single-page documentation view at `/docs` that explains:

**Core Concept Section:**
- What the app does (bulk promotional image generation)
- The three-step workflow (Templates -> Events -> Generate)
- Client-side only architecture (no server, no API keys)

**Technical Architecture Section:**
- Canvas API compositing approach
- Layer ordering (baseplate -> shadow -> below overlays -> event image -> above overlays -> text)
- localStorage persistence model
- CORS proxy usage for external images

**Key Design Decisions Section:**
- 4:5 and 5:4 safe zone calculations for social media cropping
- 3:2 default aspect ratio for event images (most common for event photography)
- Event image sizing: 95% of safe zone width, centered 100px above vertical center
- Word wrapping algorithm for long event names
- Ordinal suffix rules (1st, 2nd, 3rd, 4th-20th, 21st, etc.)

**Configuration Reference Section:**
- Text configuration options table
- Date format examples
- Location format examples
- Overlay layer behavior

**Future Enhancement Ideas Section:**
- Configurable event image width percentage and Y offset
- Additional date format customizations
- Server-side rendering with Placid API
- Template import/export as JSON

### Key Technical Decisions Explained

**Why Canvas API?**
- No server infrastructure required
- Immediate feedback in the editor
- Full control over compositing order
- Works offline after initial load

**Why localStorage?**
- Zero-config persistence
- Works without authentication
- Templates survive page refreshes
- Simple migration path for schema changes

**Why 4:5 Safe Zone?**
- Most common portrait crop for Instagram posts
- Ensures important content isn't cut off
- 5:4 covers landscape use cases

**Why CORS Proxy?**
- External event images can't be drawn directly to canvas
- `corsproxy.io` bypasses cross-origin restrictions
- Only used for fetch, not for display

**Why 3:2 Default Aspect Ratio?**
- Common aspect ratio for promotional photography
- Better match for event images than 16:9 (video thumbnails)
- Reduces preview/output mismatch

### Routing Configuration

Update `App.tsx` to include the documentation route:

```typescript
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/docs" element={<Documentation />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Documentation Page Structure

```text
/docs
+-- Hero: "Bulk Image Generator Documentation"
+-- Core Concept
|   +-- What it does
|   +-- Three-step workflow diagram
+-- Technical Architecture
|   +-- Layer compositing order
|   +-- Data flow diagram
+-- Key Decisions
|   +-- Safe zones and aspect ratios
|   +-- Text rendering approach
+-- Configuration Reference
|   +-- TextConfig fields table
|   +-- Date/location format examples
+-- Navigation link back to main app
```

### Summary

This rebuild will produce a fully functional bulk image generator with:

- 10 core component files
- 2 custom hooks for state and generation
- 1 types file with all interfaces
- 1 new documentation page
- Complete localStorage persistence
- Client-side canvas rendering
- Interactive drag-and-drop editor
- Comprehensive text formatting options

The documentation page ensures the application can be understood, maintained, and replicated in the future.

