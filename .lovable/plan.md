

## Comprehensive Documentation Pages for Migration

This plan creates multiple documentation pages, each downloadable as a PDF, capturing all development history, issues, architecture, and functionality from our chat conversations. This will enable seamless migration to another Lovable workspace.

---

## Overview of Changes

| New File | Purpose |
|----------|---------|
| `src/pages/docs/ChatHistory.tsx` | Development journey, issues raised, and solutions |
| `src/pages/docs/Architecture.tsx` | Technical architecture and data flow documentation |
| `src/pages/docs/Libraries.tsx` | All dependencies with usage notes |
| `src/pages/docs/Functionality.tsx` | Detailed feature documentation with implementation notes |
| `src/pages/docs/MigrationGuide.tsx` | Step-by-step migration instructions |
| `src/pages/DocsIndex.tsx` | Hub page linking to all documentation sections |
| `src/components/DocsPdfButton.tsx` | Reusable PDF download component |

| Modified File | Change |
|---------------|--------|
| `src/App.tsx` | Add routes for all new documentation pages |

---

## 1. Chat History & Issues Documentation

This page captures all the development conversations, issues raised, and how they were resolved:

**Issues Documented:**
- **Text Spacing Mismatch** - Preview letterSpacing not scaling with canvas scale factor, causing generated images to look different from preview
- **Template Duplication** - Request for duplicate template feature (already implemented via copy icon)
- **Cross-Project Data Access** - Clarification that each project has isolated database/localStorage
- **Migration Requirements** - User wants to move application to another Lovable workspace
- **CORS Issues** - External images blocked by CORS, solved using `corsproxy.io` and `allorigins.win` proxies
- **Event Image Positioning** - Multiple iterations to get configurable frame positioning
- **Font Weight/Family Per-Field** - Separate typography controls for event name, date, venue/location
- **Overlay Rotation/Flip** - Adding transform controls to overlays
- **Undo/Redo System** - Keyboard shortcut support for Cmd+Z/Cmd+Shift+Z
- **Storage Quota** - localStorage limits causing issues with many templates/overlays
- **Image Compression** - Added compression utilities to reduce storage footprint
- **Safe Zone Visualization** - 4:5 and 5:4 aspect ratio crop guides
- **Bottom Shadow Gradient** - Configurable opacity and height for text legibility
- **Letter Spacing** - Per-field letter spacing controls
- **Uppercase Styling** - Per-field uppercase toggle options
- **Date Formatting** - Ordinal suffixes, uppercase months, multiple format options
- **PDF Download** - Documentation export using html2pdf.js

---

## 2. Architecture Documentation

Detailed technical architecture including:

**Component Hierarchy:**
```text
App.tsx
├── Index.tsx (Main Page)
│   ├── TemplateList.tsx (Sidebar)
│   ├── TemplateEditor.tsx (Main editing area)
│   │   ├── TemplateCanvas.tsx (Live preview)
│   │   └── ImportOverlaysDialog.tsx
│   ├── EventSelector.tsx
│   │   └── ImageCropModal.tsx
│   └── ImagePreview.tsx
└── Documentation.tsx (Docs page)
```

**Data Flow:**
- Templates stored in localStorage under `bulk-image-generator-templates`
- Event data fetched from external JSON feed via CORS proxy
- Image generation uses HTML5 Canvas API
- PDF generation uses html2pdf.js

**Key Patterns:**
- Custom hooks for separation of concerns
- Undo/redo using state history stacks
- Image compression on upload
- Debounced state updates

---

## 3. Libraries Documentation

Complete dependency documentation with usage context:

**Core Dependencies:**
- `react` / `react-dom` - UI framework
- `react-router-dom` - Client-side routing
- `@tanstack/react-query` - Data fetching (available but not heavily used)
- `date-fns` - Date formatting for event dates
- `sonner` - Toast notifications
- `lucide-react` - Icon library
- `html2pdf.js` - PDF generation

**Styling:**
- `tailwindcss` - Utility CSS framework
- `tailwindcss-animate` - Animation utilities
- `class-variance-authority` - Variant styling
- `clsx` / `tailwind-merge` - Class composition

**UI Components (shadcn/ui):**
- Full list of Radix UI primitives used
- Component import paths and customizations

---

## 4. Functionality Documentation

Feature-by-feature breakdown with implementation details:

**Template Management:**
- Create, rename, duplicate, delete templates
- localStorage persistence with migration support
- Overlay presets saved per template

**Text Configuration:**
- Global: font size, line height, color, alignment, position
- Per-field: font family, weight, letter spacing, uppercase
- Field visibility toggles
- Date format options (short/long/full, ordinal, uppercase)
- Location format options (city/city-state/city-country)

**Overlay System:**
- Add overlays from files
- Import overlays from other templates
- Position, resize, rotate overlays via drag handles
- Flip horizontal/vertical
- Layer ordering (above/below event image)
- Preset save/load functionality

**Event Image Frame:**
- Configurable position (X/Y percentage)
- Configurable size (width/height percentage)
- Border radius control
- Drag-to-reposition in canvas preview

**Image Generation:**
- Canvas compositing pipeline (6 layers)
- CORS proxy handling for external images
- PNG export with proper filename

**Visual Helpers:**
- Safe zone visualization (4:5, 5:4 crop guides)
- Center snap guidelines
- Checkerboard transparency background
- Bottom shadow gradient preview

---

## 5. Migration Guide

Step-by-step instructions for moving to another project:

**Files to Copy (in order):**
1. Types: `src/types/imageGenerator.ts`
2. Utils: `src/utils/imageCompression.ts`
3. Hooks: `useTemplateStorage.ts`, `useImageGenerator.ts`, `useUndoRedo.ts`
4. Components: All custom components
5. Pages: `Index.tsx`, Documentation pages
6. Type declarations: `src/html2pdf.d.ts`

**Dependencies to Install:**
- `date-fns`
- `sonner`
- `html2pdf.js`

**shadcn/ui Components Required:**
- Button, Card, Input, Label, Checkbox, Switch
- Select, Slider, Tabs, ScrollArea, Dialog
- Tooltip, Popover, Separator

---

## 6. Documentation Hub Page

Central navigation page at `/docs` with:
- Links to all documentation sections
- PDF download buttons for each section
- Overview of what each section contains
- "Download All as PDF" option

---

## Technical Implementation Details

### Reusable PDF Button Component

```typescript
// src/components/DocsPdfButton.tsx
interface DocsPdfButtonProps {
  contentRef: RefObject<HTMLDivElement>;
  filename: string;
}
```

### Route Structure

```typescript
// New routes in App.tsx
<Route path="/docs" element={<DocsIndex />} />
<Route path="/docs/chat-history" element={<ChatHistory />} />
<Route path="/docs/architecture" element={<Architecture />} />
<Route path="/docs/libraries" element={<Libraries />} />
<Route path="/docs/functionality" element={<Functionality />} />
<Route path="/docs/migration" element={<MigrationGuide />} />
```

### PDF Configuration

Each page uses consistent html2pdf.js settings:
- A4 portrait format
- 10mm margins
- 2x scale for quality
- JPEG at 98% quality
- Page break handling

---

## Content Highlights for Chat History Page

**Issue: Text Spacing Discrepancy (Most Recent)**
- Problem: Preview showed different letter spacing than generated output
- Root Cause: `letterSpacing` wasn't multiplied by `scale` in TemplateCanvas
- Solution: Added `letterSpacing: \`${letterSpacing * scale}px\`` to preview rendering

**Issue: CORS Blocking External Images**
- Problem: Canvas couldn't export images with external URLs due to tainted canvas
- Solution: Implemented dual-proxy approach with `corsproxy.io` and `allorigins.win`

**Issue: localStorage Quota Exceeded**
- Problem: Large images filling up 5MB localStorage limit
- Solution: Added image compression utilities with WebP/PNG smart selection

**Issue: Overlay Transforms Not Rendering Correctly**
- Problem: Rotation and flip transforms not matching preview to output
- Solution: Canvas context save/restore with proper transform application order

**Issue: Per-Field Typography Controls**
- Feature Request: Different fonts/weights for event name vs date vs venue
- Solution: Extended TextFieldConfig with separate fontFamily, fontWeight, letterSpacing per field type

---

## File Size Considerations

Each documentation page is designed to:
- Use consistent styling for professional PDF output
- Include code snippets where relevant
- Use tables for reference material
- Include diagrams using ASCII art (compatible with PDF rendering)

The total addition is approximately 6 new page components plus 1 reusable component and route updates.

