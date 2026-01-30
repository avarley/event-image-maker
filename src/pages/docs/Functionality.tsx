import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { DocsPdfButton } from '@/components/DocsPdfButton';

const Functionality = () => {
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
          <DocsPdfButton contentRef={contentRef} filename="functionality" />
        </div>

        <div ref={contentRef} className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Functionality Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Detailed feature documentation with implementation notes derived from development conversations.
            </p>
          </div>

          <Separator />

          {/* Template Management */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>1. Template Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Create Template</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Click "New Template" button in left sidebar</li>
                  <li>Enter template name in prompt dialog</li>
                  <li>Template created with default settings and no baseplate</li>
                  <li>Stored in localStorage with unique ID and timestamps</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Duplicate Template</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Click copy icon on any template in the list</li>
                  <li>Creates new template with "(Copy)" suffix</li>
                  <li>Copies all settings including overlays and presets</li>
                  <li>Baseplate image is duplicated (not referenced)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Rename Template</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Double-click template name or click edit icon</li>
                  <li>Inline editing with Enter to save, Escape to cancel</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Delete Template</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Click trash icon on template</li>
                  <li>Confirmation dialog before deletion</li>
                  <li>If deleted template was selected, selects first remaining template</li>
                </ul>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Storage Format:</p>
                <pre className="text-xs overflow-x-auto">
{`interface SavedTemplate {
  id: string;
  name: string;
  baseplateDataUrl: string;  // Base64 encoded
  textConfig: TextConfig;
  textEnabled: boolean;
  overlays: SavedOverlay[];
  overlayPresets?: OverlayPreset[];
  activePresetId?: string | null;
  customFonts?: CustomFont[];
  createdAt: number;
  updatedAt: number;
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Text Configuration */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>2. Text Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Global Settings</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Font Size:</strong> Base size for all text (event name can have separate size)</li>
                  <li><strong>Event Name Font Size:</strong> Optional override for event name only</li>
                  <li><strong>Line Height:</strong> Multiplier (1.0 = 100%, 1.2 = 120%)</li>
                  <li><strong>Text Color:</strong> Hex color picker, affects all text</li>
                  <li><strong>Position X/Y:</strong> Percentage-based positioning (0-100%)</li>
                  <li><strong>Max Width:</strong> Text wrapping boundary as percentage</li>
                  <li><strong>Text Align:</strong> left, center, right</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Per-Field Typography</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Each text field type has independent typography controls:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Event Name:</strong> Font family, weight, letter spacing, uppercase toggle</li>
                  <li><strong>Date:</strong> Font family, weight, letter spacing, full uppercase toggle</li>
                  <li><strong>Venue/Location:</strong> Font family, weight, letter spacing, uppercase toggle</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Field Visibility</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Toggle visibility for: Event Name, Date, Venue, Location</li>
                  <li>Venue and Location can be shown together or separately</li>
                  <li>Hidden fields don't affect layout of visible fields</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Date Formatting Options</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Short:</strong> "Jan 15" or "Jan 15, 2025"</li>
                  <li><strong>Long:</strong> "January 15, 2025"</li>
                  <li><strong>Full:</strong> "Friday, January 15, 2025"</li>
                  <li><strong>Ordinal:</strong> Adds suffix (1st, 2nd, 3rd, 4th...)</li>
                  <li><strong>Uppercase Month:</strong> "JAN" instead of "Jan"</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Location Formatting Options</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>City only:</strong> "Austin"</li>
                  <li><strong>City + State:</strong> "Austin, TX"</li>
                  <li><strong>City + Country:</strong> "Austin, USA"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Overlay System */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>3. Overlay System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Adding Overlays</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Click "Add Overlay" button in template editor</li>
                  <li>Select image file (PNG recommended for transparency)</li>
                  <li>Image automatically compressed if large</li>
                  <li>Overlay appears centered on canvas with default size</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Positioning & Sizing</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Drag overlay to reposition</li>
                  <li>Drag corner handles to resize (maintains aspect ratio)</li>
                  <li>Position stored as percentage values for resolution independence</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Transforms</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Rotation:</strong> Slider from 0° to 360°</li>
                  <li><strong>Flip Horizontal:</strong> Mirror left-to-right</li>
                  <li><strong>Flip Vertical:</strong> Mirror top-to-bottom</li>
                  <li>Transforms combine: rotate + flip both apply</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Layer Order</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Below:</strong> Renders under event image</li>
                  <li><strong>Above:</strong> Renders on top of event image</li>
                  <li>Multiple overlays in same layer render in array order</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Overlay Presets</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Save current overlay configuration as named preset</li>
                  <li>Load preset to restore saved overlay arrangement</li>
                  <li>Presets stored per-template</li>
                  <li>Delete presets no longer needed</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Import from Other Templates</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Click "Import Overlays" button</li>
                  <li>Dialog shows overlays from all other templates</li>
                  <li>Select overlays to import</li>
                  <li>Imported overlays copy data (not referenced)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Event Image Frame */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>4. Event Image Frame</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Frame Positioning</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>X Position:</strong> 0% = left edge, 50% = centered, 100% = right edge</li>
                  <li><strong>Y Position:</strong> 0% = top, 50% = centered, 100% = bottom</li>
                  <li>Drag frame directly on canvas to reposition</li>
                  <li>Snaps to center when near 50%</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Frame Sizing</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Width:</strong> Percentage of canvas width (default 80%)</li>
                  <li><strong>Height:</strong> Percentage of canvas height (default 50%)</li>
                  <li>Event image scaled to fill frame (cover mode)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Border Radius</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Slider from 0px to 100px</li>
                  <li>Creates rounded corners on event image</li>
                  <li>Applied via canvas clipping path</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Visual Helpers */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>5. Visual Helpers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Safe Zone Visualization</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Toggle to show crop guides for social media</li>
                  <li><strong>4:5 Zone:</strong> Instagram portrait crop area</li>
                  <li><strong>5:4 Zone:</strong> Landscape crop area</li>
                  <li>Semi-transparent overlay shows what will be cropped</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Center Guidelines</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Horizontal and vertical center lines</li>
                  <li>Appear when dragging elements near center</li>
                  <li>Snap-to behavior for precise centering</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Bottom Shadow Gradient</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Toggle to enable/disable</li>
                  <li><strong>Opacity:</strong> 0-100% darkness</li>
                  <li><strong>Height:</strong> 0-100% of canvas from bottom</li>
                  <li>Improves text legibility on bright images</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Transparency Checkerboard</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Canvas background shows checkerboard pattern</li>
                  <li>Indicates transparent areas in overlays</li>
                  <li>Not rendered in final output</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Image Generation */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>6. Image Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Generation Process</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Select template from sidebar</li>
                  <li>Select event from event selector</li>
                  <li>Click "Generate Image" button</li>
                  <li>Canvas compositing renders all layers</li>
                  <li>Output saved as PNG with event-based filename</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Output Specifications</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Resolution:</strong> 1080x1080 pixels</li>
                  <li><strong>Format:</strong> PNG</li>
                  <li><strong>Filename:</strong> {`{event-name}-{template-name}.png`}</li>
                  <li><strong>Color Space:</strong> sRGB</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Bulk Generation</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Select multiple events</li>
                  <li>Click "Generate All" button</li>
                  <li>Sequential generation with progress indicator</li>
                  <li>Download all as ZIP or individually</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">CORS Handling</h4>
                <p className="text-sm text-muted-foreground">
                  External event images are fetched through CORS proxies to avoid canvas tainting:
                </p>
                <pre className="text-xs bg-muted p-3 rounded-lg mt-2">
{`Primary: corsproxy.io
Fallback: api.allorigins.win`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Undo/Redo */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>7. Undo/Redo System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong>Cmd/Ctrl + Z:</strong> Undo last action</li>
                  <li><strong>Cmd/Ctrl + Shift + Z:</strong> Redo</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">What Gets Tracked</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Text configuration changes</li>
                  <li>Overlay position/size/rotation changes</li>
                  <li>Event image frame changes</li>
                  <li>Field visibility toggles</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">History Limits</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Maintains last 50 states</li>
                  <li>Older states automatically pruned</li>
                  <li>History resets on template switch</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fonts */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>8. Custom Font Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Built-in Fonts</h4>
                <p className="text-sm text-muted-foreground">
                  The application includes Adobe Fonts (Typekit) integration. Default font is 
                  "aktiv-grotesk-condensed" which provides excellent readability at various sizes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Font Weight Options</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>400 - Regular</li>
                  <li>500 - Medium</li>
                  <li>600 - Semi-Bold</li>
                  <li>700 - Bold</li>
                  <li>900 - Black</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Custom Font Upload</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Upload .ttf, .otf, .woff, or .woff2 files</li>
                  <li>Fonts stored as base64 in template data</li>
                  <li>Available in font family dropdown after upload</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Functionality documentation derived from development chat history. Covers all features as of the latest version.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Functionality;
