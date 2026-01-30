import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle, AlertTriangle, FileCode, FolderOpen } from 'lucide-react';
import { DocsPdfButton } from '@/components/DocsPdfButton';

const MigrationGuide = () => {
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
          <DocsPdfButton contentRef={contentRef} filename="migration-guide" />
        </div>

        <div ref={contentRef} className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Migration Guide</h1>
            <p className="text-muted-foreground text-lg">
              Step-by-step instructions for migrating the Bulk Image Generator to another Lovable workspace.
            </p>
          </div>

          <Separator />

          {/* Prerequisites */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>New Lovable project created (blank or from a React template)</li>
                <li>Access to this project's source files (via PDF downloads or direct copy)</li>
                <li>Basic understanding of React and TypeScript</li>
              </ul>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Important:</strong> localStorage data (templates) cannot be migrated between projects. 
                  You will need to recreate templates in the new project or implement a JSON export/import feature.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Dependencies */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                Install Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add these packages to your new Lovable project:
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Essential Dependencies</h4>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`date-fns
sonner
html2pdf.js`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">shadcn/ui Components</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Run these commands in your Lovable project terminal or add via the UI:
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`# Core components
button, card, checkbox, dialog, input, label

# Form components
popover, select, slider, switch, tabs

# Display components
scroll-area, separator, toast, tooltip, table`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Type Definitions */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                Copy Type Definitions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create the types directory and copy the type definitions first, as other files depend on them.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source File</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/types/imageGenerator.ts</TableCell>
                    <TableCell className="font-mono text-sm">src/types/imageGenerator.ts</TableCell>
                    <TableCell>All interfaces and types</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/html2pdf.d.ts</TableCell>
                    <TableCell className="font-mono text-sm">src/html2pdf.d.ts</TableCell>
                    <TableCell>TypeScript declaration for html2pdf.js</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Step 3: Utilities */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                Copy Utility Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source File</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/utils/imageCompression.ts</TableCell>
                    <TableCell>Image compression for storage optimization</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">src/lib/utils.ts</TableCell>
                    <TableCell>cn() utility for class merging (likely already exists)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Step 4: Hooks */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                Copy Custom Hooks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These hooks contain core business logic and must be copied in order:
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Dependencies</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">useUndoRedo.ts</TableCell>
                    <TableCell>None (standalone)</TableCell>
                    <TableCell>State history management</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">useTemplateStorage.ts</TableCell>
                    <TableCell>types/imageGenerator.ts, imageCompression.ts</TableCell>
                    <TableCell>localStorage persistence</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">useImageGenerator.ts</TableCell>
                    <TableCell>types/imageGenerator.ts</TableCell>
                    <TableCell>Canvas compositing and export</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Step 5: Components */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">5</span>
                Copy Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy all custom components. Order matters due to dependencies:
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Core Components (copy first)
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li><code>TemplateCanvas.tsx</code> - Live preview canvas</li>
                    <li><code>TextConfigPanel.tsx</code> - Typography controls</li>
                    <li><code>TemplateList.tsx</code> - Template sidebar</li>
                    <li><code>TemplateEditor.tsx</code> - Main editing area</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Supporting Components
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li><code>EventSelector.tsx</code> - Event picker</li>
                    <li><code>ImageCropModal.tsx</code> - Image cropping dialog</li>
                    <li><code>ImagePreview.tsx</code> - Generated image preview</li>
                    <li><code>ImportOverlaysDialog.tsx</code> - Overlay import modal</li>
                    <li><code>NavLink.tsx</code> - Navigation component</li>
                    <li><code>DocsPdfButton.tsx</code> - PDF download button</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 6: Pages */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">6</span>
                Copy Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/Index.tsx</TableCell>
                    <TableCell>/</TableCell>
                    <TableCell>Main application</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/DocsIndex.tsx</TableCell>
                    <TableCell>/docs</TableCell>
                    <TableCell>Documentation hub</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/docs/ChatHistory.tsx</TableCell>
                    <TableCell>/docs/chat-history</TableCell>
                    <TableCell>Development issues</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/docs/Architecture.tsx</TableCell>
                    <TableCell>/docs/architecture</TableCell>
                    <TableCell>Technical architecture</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/docs/Libraries.tsx</TableCell>
                    <TableCell>/docs/libraries</TableCell>
                    <TableCell>Dependencies</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/docs/Functionality.tsx</TableCell>
                    <TableCell>/docs/functionality</TableCell>
                    <TableCell>Features</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">pages/docs/MigrationGuide.tsx</TableCell>
                    <TableCell>/docs/migration</TableCell>
                    <TableCell>This guide</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Step 7: Routes */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">7</span>
                Update Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add routes to your App.tsx:
              </p>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import Index from "./pages/Index";
import DocsIndex from "./pages/DocsIndex";
import ChatHistory from "./pages/docs/ChatHistory";
import Architecture from "./pages/docs/Architecture";
import Libraries from "./pages/docs/Libraries";
import Functionality from "./pages/docs/Functionality";
import MigrationGuide from "./pages/docs/MigrationGuide";

// In Routes:
<Route path="/" element={<Index />} />
<Route path="/docs" element={<DocsIndex />} />
<Route path="/docs/chat-history" element={<ChatHistory />} />
<Route path="/docs/architecture" element={<Architecture />} />
<Route path="/docs/libraries" element={<Libraries />} />
<Route path="/docs/functionality" element={<Functionality />} />
<Route path="/docs/migration" element={<MigrationGuide />} />`}
              </pre>
            </CardContent>
          </Card>

          {/* Step 8: Fonts */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">8</span>
                Configure Fonts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add Adobe Fonts (Typekit) to your index.html:
              </p>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`<!-- In <head> section of index.html -->
<link rel="stylesheet" href="https://use.typekit.net/YOUR_KIT_ID.css">`}
              </pre>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> You'll need your own Adobe Fonts subscription and kit ID. 
                  The default font used is "aktiv-grotesk-condensed". If unavailable, update the 
                  DEFAULT_TEXT_FIELDS in types/imageGenerator.ts to use a different font.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verification Checklist */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Application loads without console errors',
                  'Can create new template',
                  'Can upload baseplate image',
                  'Can add and position overlays',
                  'Event selector loads events',
                  'Image generation produces correct output',
                  'PDF export works on docs pages',
                  'Undo/Redo keyboard shortcuts work',
                  'Templates persist after page refresh',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border rounded flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Import errors</h4>
                <p className="text-sm text-muted-foreground">
                  Check that all files are in correct directories and imports use @/ alias correctly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Font not rendering</h4>
                <p className="text-sm text-muted-foreground">
                  Verify Adobe Fonts kit is loaded and font-family names match exactly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">CORS errors on event images</h4>
                <p className="text-sm text-muted-foreground">
                  The CORS proxy URLs in useImageGenerator.ts may need updating if they become unavailable.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">localStorage quota exceeded</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure imageCompression.ts is properly imported and used when saving images.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Migration guide for Bulk Image Generator. Follow steps in order for best results.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationGuide;
