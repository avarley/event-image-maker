import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Code, Package, Wrench, Truck, MessageSquare } from 'lucide-react';

const docSections = [
  {
    title: 'Chat History & Issues',
    description: 'Complete development journey, all issues raised during development, and their solutions.',
    path: '/docs/chat-history',
    icon: MessageSquare,
  },
  {
    title: 'Architecture',
    description: 'Technical architecture, component hierarchy, data flow patterns, and design decisions.',
    path: '/docs/architecture',
    icon: Code,
  },
  {
    title: 'Libraries & Dependencies',
    description: 'All npm packages used with version info and usage context.',
    path: '/docs/libraries',
    icon: Package,
  },
  {
    title: 'Functionality',
    description: 'Detailed feature documentation with implementation notes and code references.',
    path: '/docs/functionality',
    icon: Wrench,
  },
  {
    title: 'Migration Guide',
    description: 'Step-by-step instructions for migrating to another Lovable workspace.',
    path: '/docs/migration',
    icon: Truck,
  },
];

const DocsIndex = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Bulk Image Generator Documentation</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive documentation for migrating this application to another Lovable workspace.
            Each section can be downloaded as a PDF for offline reference.
          </p>
        </div>

        <div className="grid gap-4">
          {docSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.path} to={section.path}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">About This Documentation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This documentation was generated to capture the complete development history, 
              technical decisions, and implementation details of the Bulk Image Generator application.
            </p>
            <p>
              Each page includes a "Download PDF" button that generates a high-quality PDF 
              suitable for sharing or offline reference during migration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocsIndex;
