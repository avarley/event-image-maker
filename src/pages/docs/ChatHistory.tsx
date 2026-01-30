import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, AlertCircle, CheckCircle, Bug, Lightbulb } from 'lucide-react';
import { DocsPdfButton } from '@/components/DocsPdfButton';

interface IssueEntry {
  id: string;
  title: string;
  type: 'bug' | 'feature' | 'clarification';
  status: 'resolved' | 'implemented';
  problem: string;
  rootCause?: string;
  solution: string;
  codeExample?: string;
}

const issues: IssueEntry[] = [
  {
    id: 'text-spacing',
    title: 'Text Spacing Mismatch Between Preview and Generated Output',
    type: 'bug',
    status: 'resolved',
    problem: 'The preview canvas showed different letter spacing than the final generated PNG image. Users would configure text to look perfect in the preview, but the exported image would have incorrect spacing.',
    rootCause: 'The letterSpacing CSS property in TemplateCanvas.tsx was not being multiplied by the canvas scale factor. While other properties like fontSize were correctly scaled, letterSpacing was applied at its raw value.',
    solution: 'Added scale multiplication to the letterSpacing property in the text rendering styles.',
    codeExample: `// Before (incorrect)
style={{
  letterSpacing: \`\${letterSpacing}px\`,
}}

// After (correct)
style={{
  letterSpacing: \`\${letterSpacing * scale}px\`,
}}`
  },
  {
    id: 'cors-images',
    title: 'CORS Blocking External Event Images',
    type: 'bug',
    status: 'resolved',
    problem: 'When attempting to generate images with external event photos, the canvas would become "tainted" and refuse to export. The browser blocked cross-origin image data access.',
    rootCause: 'External images from event feeds don\'t include CORS headers, preventing canvas export after drawing them.',
    solution: 'Implemented a dual-proxy approach using corsproxy.io as primary and allorigins.win as fallback. Images are fetched through these proxies with crossOrigin="anonymous" set.',
    codeExample: `// CORS proxy implementation
const proxyUrl = (url: string) => {
  return \`https://corsproxy.io/?\${encodeURIComponent(url)}\`;
};

// Fallback proxy
const fallbackProxyUrl = (url: string) => {
  return \`https://api.allorigins.win/raw?url=\${encodeURIComponent(url)}\`;
};`
  },
  {
    id: 'storage-quota',
    title: 'localStorage Quota Exceeded with Large Templates',
    type: 'bug',
    status: 'resolved',
    problem: 'Users with many templates containing large overlay images were hitting the 5MB localStorage limit, causing the app to fail when saving.',
    rootCause: 'Base64-encoded images stored directly without compression were consuming excessive storage space.',
    solution: 'Added image compression utilities that automatically compress images on upload using WebP format with PNG fallback for transparency. Implemented smart format selection based on transparency detection.',
    codeExample: `// Image compression utility
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> => {
  // Compress and convert to WebP/PNG based on transparency
};`
  },
  {
    id: 'overlay-transforms',
    title: 'Overlay Rotation and Flip Not Matching Preview',
    type: 'bug',
    status: 'resolved',
    problem: 'When overlays were rotated or flipped in the preview, the generated image would show them in incorrect positions or orientations.',
    rootCause: 'Canvas context transformations were not being properly saved and restored, causing transforms to compound or apply incorrectly.',
    solution: 'Implemented proper context.save() and context.restore() calls around each overlay rendering, with correct transform order: translate to center → rotate → scale for flip → draw at offset.',
    codeExample: `// Correct transform order for overlays
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate((rotation * Math.PI) / 180);
ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
ctx.drawImage(overlay, -width/2, -height/2, width, height);
ctx.restore();`
  },
  {
    id: 'per-field-typography',
    title: 'Per-Field Font Family and Weight Controls',
    type: 'feature',
    status: 'implemented',
    problem: 'Users wanted different typography settings for event name, date, and venue/location fields. The initial implementation only allowed a single font family for all text.',
    solution: 'Extended TextFieldConfig interface to include separate fontFamily, fontWeight, and letterSpacing properties for each text field type (eventName, date, venueLocation).',
    codeExample: `// Extended TextFieldConfig
interface TextFieldConfig {
  // Per-field font weights
  eventNameFontWeight?: FontWeight;
  dateFontWeight?: FontWeight;
  venueLocationFontWeight?: FontWeight;
  // Per-field font families
  eventNameFontFamily?: string;
  dateFontFamily?: string;
  venueLocationFontFamily?: string;
  // Per-field letter spacing
  eventNameLetterSpacing?: number;
  dateLetterSpacing?: number;
  venueLocationLetterSpacing?: number;
}`
  },
  {
    id: 'undo-redo',
    title: 'Undo/Redo System with Keyboard Shortcuts',
    type: 'feature',
    status: 'implemented',
    problem: 'Users needed the ability to undo mistakes when editing templates, especially after moving overlays or changing text settings.',
    solution: 'Created useUndoRedo hook that maintains past and future state stacks. Added keyboard shortcut support for Cmd/Ctrl+Z (undo) and Cmd/Ctrl+Shift+Z (redo).',
    codeExample: `// useUndoRedo hook
const useUndoRedo = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  
  const undo = () => { /* restore from past */ };
  const redo = () => { /* restore from future */ };
  
  return { state, setState, undo, redo, canUndo, canRedo };
};`
  },
  {
    id: 'event-image-positioning',
    title: 'Configurable Event Image Frame Position',
    type: 'feature',
    status: 'implemented',
    problem: 'The event image was fixed in position. Users needed to place it at different locations on the canvas depending on their template design.',
    solution: 'Added eventImageX, eventImageY, eventImageWidth, eventImageHeight percentage-based positioning with drag-to-reposition in the canvas preview.',
    codeExample: `// TextConfig extensions for event image frame
eventImageX?: number;      // X position as percentage (0-100)
eventImageY?: number;      // Y position as percentage (0-100)
eventImageWidth?: number;  // Width as percentage of canvas
eventImageHeight?: number; // Height as percentage of canvas
eventImageBorderRadius?: number;`
  },
  {
    id: 'safe-zones',
    title: 'Safe Zone Visualization for Social Media Crops',
    type: 'feature',
    status: 'implemented',
    problem: 'Users creating images for social media needed to see where content would be cropped for different aspect ratios (4:5 for Instagram, etc.).',
    solution: 'Added visual overlay showing 4:5 and 5:4 aspect ratio safe zones with toggle controls. Semi-transparent areas show content that will be cropped.',
  },
  {
    id: 'bottom-shadow',
    title: 'Bottom Shadow Gradient for Text Legibility',
    type: 'feature',
    status: 'implemented',
    problem: 'Text overlaid on bright or busy images was difficult to read. Users needed a way to darken the background behind text.',
    solution: 'Added configurable bottom shadow gradient with opacity (0-100%) and height (0-100% of canvas) controls.',
    codeExample: `// Bottom shadow configuration
bottomShadowEnabled?: boolean;
bottomShadowOpacity?: number;  // 0-100
bottomShadowHeight?: number;   // 0-100 percentage`
  },
  {
    id: 'date-formatting',
    title: 'Advanced Date Formatting Options',
    type: 'feature',
    status: 'implemented',
    problem: 'Users needed various date formats including ordinal suffixes (1st, 2nd, 3rd) and uppercase months for design consistency.',
    solution: 'Added dateFormat (short/long/full), dateOrdinal boolean for ordinal suffixes, and dateUppercase for uppercase month names.',
    codeExample: `// Date formatting options
dateFormat: 'short' | 'long' | 'full';
dateOrdinal?: boolean;    // 7th instead of 7
dateUppercase?: boolean;  // FEB instead of Feb`
  },
  {
    id: 'template-duplication',
    title: 'Template Duplication Feature',
    type: 'clarification',
    status: 'resolved',
    problem: 'User asked for a way to duplicate templates to create variations without starting from scratch.',
    solution: 'Clarified that this feature already exists via the copy icon button in the template list. The duplicate creates a new template with "(Copy)" appended to the name.',
  },
  {
    id: 'cross-project-data',
    title: 'Cross-Project Data Access Clarification',
    type: 'clarification',
    status: 'resolved',
    problem: 'User asked if templates from one Lovable project could access data from another project.',
    solution: 'Clarified that each Lovable project has completely isolated localStorage and database. No cross-project data sharing is possible. This led to the migration documentation initiative.',
  },
  {
    id: 'overlay-presets',
    title: 'Overlay Preset Save/Load System',
    type: 'feature',
    status: 'implemented',
    problem: 'Users wanted to save overlay configurations and reuse them across different events or after resetting.',
    solution: 'Added overlay preset system allowing users to save current overlay configurations with names, and load them back later. Presets are stored per-template.',
  },
  {
    id: 'uppercase-styling',
    title: 'Per-Field Uppercase Toggle',
    type: 'feature',
    status: 'implemented',
    problem: 'Users wanted to style some text fields as uppercase (like EVENT NAME) while keeping others in normal case.',
    solution: 'Added uppercase boolean toggles for each text field type in TextFieldConfig.',
    codeExample: `// Uppercase options
eventNameUppercase?: boolean;
dateFullUppercase?: boolean;
venueLocationUppercase?: boolean;`
  },
  {
    id: 'import-overlays',
    title: 'Import Overlays from Other Templates',
    type: 'feature',
    status: 'implemented',
    problem: 'Users had overlays in one template that they wanted to use in another without re-uploading.',
    solution: 'Added ImportOverlaysDialog component that lists overlays from other templates and allows importing them into the current template.',
  },
];

const ChatHistory = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const getTypeIcon = (type: IssueEntry['type']) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4 text-destructive" />;
      case 'feature': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'clarification': return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: IssueEntry['type']) => {
    switch (type) {
      case 'bug': return 'Bug Fix';
      case 'feature': return 'Feature Request';
      case 'clarification': return 'Clarification';
    }
  };

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
          <DocsPdfButton contentRef={contentRef} filename="chat-history-issues" />
        </div>

        <div ref={contentRef} className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Development Chat History & Issues</h1>
            <p className="text-muted-foreground text-lg mb-2">
              Complete record of all issues raised during development, feature requests, and their resolutions.
            </p>
            <p className="text-sm text-muted-foreground">
              Total Issues Documented: {issues.length} | 
              Bugs: {issues.filter(i => i.type === 'bug').length} | 
              Features: {issues.filter(i => i.type === 'feature').length} | 
              Clarifications: {issues.filter(i => i.type === 'clarification').length}
            </p>
          </div>

          <Separator />

          <div className="space-y-6">
            {issues.map((issue, index) => (
              <Card key={issue.id} className="break-inside-avoid">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">#{index + 1}</span>
                      {getTypeIcon(issue.type)}
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {getTypeLabel(issue.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs capitalize">{issue.status}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{issue.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Problem</h4>
                    <p className="text-sm text-muted-foreground">{issue.problem}</p>
                  </div>
                  
                  {issue.rootCause && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Root Cause</h4>
                      <p className="text-sm text-muted-foreground">{issue.rootCause}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Solution</h4>
                    <p className="text-sm text-muted-foreground">{issue.solution}</p>
                  </div>
                  
                  {issue.codeExample && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Code Reference</h4>
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                        <code>{issue.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Document generated for migration purposes. Contains all development history from the Lovable chat interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
