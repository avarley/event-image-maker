import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, Palette, Layout, Wrench } from 'lucide-react';
import { DocsPdfButton } from '@/components/DocsPdfButton';

const Libraries = () => {
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
          <DocsPdfButton contentRef={contentRef} filename="libraries-dependencies" />
        </div>

        <div ref={contentRef} className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Libraries & Dependencies</h1>
            <p className="text-muted-foreground text-lg">
              Complete list of all npm packages used in this project with version information and usage context.
            </p>
          </div>

          <Separator />

          {/* Core Dependencies */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Core Dependencies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">react</TableCell>
                    <TableCell>^18.3.1</TableCell>
                    <TableCell>Core UI framework</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">react-dom</TableCell>
                    <TableCell>^18.3.1</TableCell>
                    <TableCell>React DOM renderer</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">react-router-dom</TableCell>
                    <TableCell>^6.30.1</TableCell>
                    <TableCell>Client-side routing for /docs pages</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">@tanstack/react-query</TableCell>
                    <TableCell>^5.83.0</TableCell>
                    <TableCell>Data fetching (available, minimally used)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">date-fns</TableCell>
                    <TableCell>^3.6.0</TableCell>
                    <TableCell>Date formatting for event dates</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">sonner</TableCell>
                    <TableCell>^1.7.4</TableCell>
                    <TableCell>Toast notifications</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">lucide-react</TableCell>
                    <TableCell>^0.462.0</TableCell>
                    <TableCell>Icon library (all icons)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">html2pdf.js</TableCell>
                    <TableCell>^0.14.0</TableCell>
                    <TableCell>PDF generation for documentation export</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">zod</TableCell>
                    <TableCell>^3.25.76</TableCell>
                    <TableCell>Schema validation (available)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Styling Dependencies */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Styling Dependencies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">tailwindcss</TableCell>
                    <TableCell>(dev)</TableCell>
                    <TableCell>Utility-first CSS framework</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">tailwindcss-animate</TableCell>
                    <TableCell>^1.0.7</TableCell>
                    <TableCell>Animation utilities for Tailwind</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">class-variance-authority</TableCell>
                    <TableCell>^0.7.1</TableCell>
                    <TableCell>Component variant styling (cva)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">clsx</TableCell>
                    <TableCell>^2.1.1</TableCell>
                    <TableCell>Conditional class composition</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">tailwind-merge</TableCell>
                    <TableCell>^2.6.0</TableCell>
                    <TableCell>Merge Tailwind classes without conflicts</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Usage Pattern:</p>
                <pre className="text-xs">
{`// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* UI Components (shadcn/ui) */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <CardTitle>UI Components (shadcn/ui)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This project uses shadcn/ui components built on Radix UI primitives. These are copied 
                into the project (not npm installed) and can be customized.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Radix Package</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Component(s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-accordion</TableCell>
                    <TableCell>^1.2.11</TableCell>
                    <TableCell>Accordion</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-alert-dialog</TableCell>
                    <TableCell>^1.1.14</TableCell>
                    <TableCell>AlertDialog</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-checkbox</TableCell>
                    <TableCell>^1.3.2</TableCell>
                    <TableCell>Checkbox</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-dialog</TableCell>
                    <TableCell>^1.1.14</TableCell>
                    <TableCell>Dialog, Sheet</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-dropdown-menu</TableCell>
                    <TableCell>^2.1.15</TableCell>
                    <TableCell>DropdownMenu</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-label</TableCell>
                    <TableCell>^2.1.7</TableCell>
                    <TableCell>Label</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-popover</TableCell>
                    <TableCell>^1.1.14</TableCell>
                    <TableCell>Popover</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-scroll-area</TableCell>
                    <TableCell>^1.2.9</TableCell>
                    <TableCell>ScrollArea</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-select</TableCell>
                    <TableCell>^2.2.5</TableCell>
                    <TableCell>Select</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-separator</TableCell>
                    <TableCell>^1.1.7</TableCell>
                    <TableCell>Separator</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-slider</TableCell>
                    <TableCell>^1.3.5</TableCell>
                    <TableCell>Slider</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-slot</TableCell>
                    <TableCell>^1.2.3</TableCell>
                    <TableCell>Slot (for asChild pattern)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-switch</TableCell>
                    <TableCell>^1.2.5</TableCell>
                    <TableCell>Switch</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-tabs</TableCell>
                    <TableCell>^1.1.12</TableCell>
                    <TableCell>Tabs</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-toast</TableCell>
                    <TableCell>^1.2.14</TableCell>
                    <TableCell>Toast</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">@radix-ui/react-tooltip</TableCell>
                    <TableCell>^1.2.7</TableCell>
                    <TableCell>Tooltip</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Components Actually Used in This App:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    'Button', 'Card', 'Checkbox', 'Dialog', 'Input', 'Label',
                    'Popover', 'ScrollArea', 'Select', 'Separator', 'Slider',
                    'Switch', 'Tabs', 'Toast', 'Tooltip', 'Table'
                  ].map(comp => (
                    <span key={comp} className="px-2 py-1 bg-background rounded border">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Build Tools */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <CardTitle>Build Tools & Dev Dependencies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">vite</TableCell>
                    <TableCell>Build tool and dev server</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">typescript</TableCell>
                    <TableCell>Type checking</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">eslint</TableCell>
                    <TableCell>Code linting</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">vitest</TableCell>
                    <TableCell>Unit testing framework</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">postcss</TableCell>
                    <TableCell>CSS processing (for Tailwind)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">autoprefixer</TableCell>
                    <TableCell>CSS vendor prefixing</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Special Notes */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Special Configuration Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">html2pdf.js Type Declaration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  html2pdf.js doesn't include TypeScript types, so a declaration file is required:
                </p>
                <pre className="text-xs bg-muted p-3 rounded-lg">
{`// src/html2pdf.d.ts
declare module 'html2pdf.js';`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Path Aliases</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The project uses @ as an alias for src/ directory:
                </p>
                <pre className="text-xs bg-muted p-3 rounded-lg">
{`// tsconfig.json / vite.config.ts
"paths": {
  "@/*": ["./src/*"]
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Font Loading</h4>
                <p className="text-sm text-muted-foreground">
                  Custom fonts are loaded via Adobe Fonts (Typekit) in index.html. The default font 
                  is "aktiv-grotesk-condensed" which must be available for text rendering to work correctly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Installation Commands */}
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Installation Commands for Migration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                When migrating to a new Lovable project, install these essential dependencies:
              </p>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`# Core dependencies
npm install date-fns sonner html2pdf.js

# shadcn/ui components (run via CLI)
npx shadcn-ui@latest add button card checkbox dialog input label
npx shadcn-ui@latest add popover scroll-area select separator slider
npx shadcn-ui@latest add switch tabs toast tooltip table`}
              </pre>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Dependencies documentation for Bulk Image Generator migration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Libraries;
