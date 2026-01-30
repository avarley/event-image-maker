import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { DocsPdfButton } from '@/components/DocsPdfButton';

const Architecture = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link to="/docs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Docs
            </Button>
          </Link>
          <DocsPdfButton contentRef={contentRef} filename="architecture" />
        </div>

        <div ref={contentRef} className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Technical Architecture</h1>
            <p className="text-muted-foreground text-lg">
              Complete technical architecture documentation including component hierarchy, data flow, and design patterns.
            </p>
          </div>

          <Separator />

          {/* Component Hierarchy */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Component Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`App.tsx
├── BrowserRouter
│   └── Routes
│       ├── "/" → Index.tsx (Main Application)
│       │   ├── TemplateList.tsx (Left Sidebar)
│       │   │   └── Template items with CRUD controls
│       │   ├── TemplateEditor.tsx (Center Panel)
│       │   │   ├── TemplateCanvas.tsx (Live Preview)
│       │   │   │   ├── Baseplate image layer
│       │   │   │   ├── Overlay layers (below)
│       │   │   │   ├── Event image frame
│       │   │   │   ├── Overlay layers (above)
│       │   │   │   ├── Bottom shadow gradient
│       │   │   │   └── Text overlay
│       │   │   ├── TextConfigPanel.tsx (Right Panel)
│       │   │   │   ├── Global text settings
│       │   │   │   └── Per-field typography controls
│       │   │   └── ImportOverlaysDialog.tsx
│       │   ├── EventSelector.tsx (Event Picker)
│       │   │   └── ImageCropModal.tsx
│       │   └── ImagePreview.tsx (Generated Output)
│       ├── "/docs" → DocsIndex.tsx
│       └── "/docs/*" → Documentation pages
└── Providers
    ├── QueryClientProvider (React Query)
    ├── TooltipProvider
    ├── Toaster (shadcn)
    └── Sonner (toast notifications)`}
              </pre>
            </CardContent>
          </Card>

          {/* Data Flow */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Data Flow Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Template Data Flow</h4>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌─────────────────────────────────────────────────────────┐
│                    localStorage                          │
│    Key: "bulk-image-generator-templates"                │
│    Value: SavedTemplate[]                               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              useTemplateStorage Hook                     │
│  • Load templates on mount                              │
│  • Save on every change (debounced)                     │
│  • Handle migration from older formats                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Index.tsx (State)                       │
│  • selectedTemplateId                                   │
│  • templates: TemplateConfig[]                          │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│TemplateList  │ │TemplateEditor│ │TemplateCanvas│
│ (sidebar)    │ │ (controls)   │ │ (preview)    │
└──────────────┘ └──────────────┘ └──────────────┘`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Event Data Flow</h4>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`External JSON Feed
        │
        ▼ (via CORS proxy)
┌─────────────────────────────────────────────────────────┐
│    CORS Proxies: corsproxy.io / allorigins.win         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              EventSelector Component                     │
│  • Fetches event list                                   │
│  • Displays searchable event grid                       │
│  • User selects event                                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Selected Event                          │
│  • EventData passed to TemplateCanvas                   │
│  • EventData passed to ImageGenerator                   │
└─────────────────────────────────────────────────────────┘`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Image Generation Pipeline</h4>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌─────────────────────────────────────────────────────────┐
│              useImageGenerator Hook                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
Step 1: Create offscreen canvas (1080x1080)
                        │
                        ▼
Step 2: Draw baseplate image
                        │
                        ▼
Step 3: Draw overlays with layer="below"
        • Apply rotation/flip transforms
                        │
                        ▼
Step 4: Draw event image in frame
        • Apply border radius clipping
        • Fetch via CORS proxy if external
                        │
                        ▼
Step 5: Draw overlays with layer="above"
        • Apply rotation/flip transforms
                        │
                        ▼
Step 6: Draw bottom shadow gradient
        • If enabled, with configured opacity/height
                        │
                        ▼
Step 7: Draw text
        • Event name (with per-field typography)
        • Date (formatted per settings)
        • Venue/Location
                        │
                        ▼
Step 8: Export as PNG (canvas.toDataURL)
                        │
                        ▼
Output: GeneratedImage { eventId, eventName, dataUrl }`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Key Files */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Key Files & Their Purposes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Lines (approx)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/types/imageGenerator.ts</TableCell>
                    <TableCell>All TypeScript interfaces and types</TableCell>
                    <TableCell>~160</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/hooks/useImageGenerator.ts</TableCell>
                    <TableCell>Canvas compositing and image export</TableCell>
                    <TableCell>~400</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/hooks/useTemplateStorage.ts</TableCell>
                    <TableCell>localStorage persistence and migration</TableCell>
                    <TableCell>~250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/hooks/useUndoRedo.ts</TableCell>
                    <TableCell>State history for undo/redo</TableCell>
                    <TableCell>~80</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/components/TemplateCanvas.tsx</TableCell>
                    <TableCell>Live preview with drag handles</TableCell>
                    <TableCell>~600</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/components/TemplateEditor.tsx</TableCell>
                    <TableCell>Template editing controls</TableCell>
                    <TableCell>~500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/components/TextConfigPanel.tsx</TableCell>
                    <TableCell>Typography configuration UI</TableCell>
                    <TableCell>~400</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/pages/Index.tsx</TableCell>
                    <TableCell>Main application page</TableCell>
                    <TableCell>~350</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/utils/imageCompression.ts</TableCell>
                    <TableCell>Image compression utilities</TableCell>
                    <TableCell>~100</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Design Patterns */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Design Patterns Used</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Custom Hooks for Separation of Concerns</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Business logic is extracted into custom hooks, keeping components focused on UI:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><code>useTemplateStorage</code> - Persistence layer abstraction</li>
                  <li><code>useImageGenerator</code> - Canvas operations and image export</li>
                  <li><code>useUndoRedo</code> - State history management</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Controlled Component Pattern</h4>
                <p className="text-sm text-muted-foreground">
                  All form inputs and canvas interactions are controlled components, with state lifted to 
                  the nearest common parent. This enables undo/redo and consistent state management.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Composition over Inheritance</h4>
                <p className="text-sm text-muted-foreground">
                  Components are composed together rather than extended. The TemplateCanvas receives 
                  all configuration as props and renders layers compositionally.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Proxy Pattern for CORS</h4>
                <p className="text-sm text-muted-foreground">
                  External image URLs are transparently proxied through CORS services, abstracting 
                  the complexity away from consuming code.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Command Pattern for Undo/Redo</h4>
                <p className="text-sm text-muted-foreground">
                  State changes are stored in history stacks, allowing navigation through previous states 
                  without mutation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* State Management */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>State Management Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Local State (useState)</h4>
                <p className="text-sm text-muted-foreground">
                  Used for component-local UI state like modal visibility, hover states, and form inputs.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Lifted State (Index.tsx)</h4>
                <p className="text-sm text-muted-foreground">
                  Template configuration and selection state is lifted to Index.tsx and passed down 
                  to child components. This is the single source of truth for the current template.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Persisted State (localStorage)</h4>
                <p className="text-sm text-muted-foreground">
                  Templates are persisted to localStorage via useTemplateStorage hook. Changes are 
                  debounced to avoid excessive writes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">No Global State Library</h4>
                <p className="text-sm text-muted-foreground">
                  The application deliberately avoids Redux, Zustand, or other global state libraries. 
                  The component tree is shallow enough that prop drilling is manageable, and the 
                  custom hooks provide sufficient abstraction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Canvas Rendering */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Canvas Rendering Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Layer Order (bottom to top)</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Baseplate image (template background)</li>
                  <li>Overlays with layer="below"</li>
                  <li>Event image (in configurable frame)</li>
                  <li>Overlays with layer="above"</li>
                  <li>Bottom shadow gradient (if enabled)</li>
                  <li>Text overlay (event name, date, venue/location)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Canvas Scale Factor</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The preview canvas uses a scale factor to fit within the available space while 
                  maintaining the full 1080x1080 output resolution:
                </p>
                <pre className="text-sm bg-muted p-3 rounded-lg">
{`const scale = Math.min(
  containerWidth / 1080,
  containerHeight / 1080
);`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Important: Scaling Properties</h4>
                <p className="text-sm text-muted-foreground">
                  ALL size-based CSS properties in the preview must be multiplied by the scale factor, 
                  including fontSize, letterSpacing, borderRadius, etc. This ensures WYSIWYG accuracy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Architecture documentation for Bulk Image Generator. For migration, ensure all files maintain these relationships.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
