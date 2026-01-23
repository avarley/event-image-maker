import { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SavedTemplate, TextConfig } from '@/types/imageGenerator';
import { TemplateCanvas } from './TemplateCanvas';

interface TemplateEditorProps {
  template: SavedTemplate | null;
  onUpdateTemplate: (id: string, updates: Partial<SavedTemplate>) => void;
  sampleEventName?: string;
}

const FONT_FAMILIES = [
  'Roboto',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Lucida Console',
];

export const TemplateEditor = ({
  template,
  onUpdateTemplate,
  sampleEventName = 'Sample Event Name',
}: TemplateEditorProps) => {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!template) return;
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const dataUrl = event.target?.result as string;
          
          onUpdateTemplate(template.id, {
            baseplateDataUrl: dataUrl,
            textConfig: {
              ...template.textConfig,
              x: Math.floor(img.width / 2),
              maxWidth: img.width - 100,
            },
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [template, onUpdateTemplate]
  );

  const handleTextConfigChange = useCallback(
    (textConfig: TextConfig) => {
      if (!template) return;
      onUpdateTemplate(template.id, { textConfig });
    },
    [template, onUpdateTemplate]
  );

  const handleTextFieldChange = useCallback(
    (key: keyof TextConfig, value: string | number) => {
      if (!template) return;
      onUpdateTemplate(template.id, {
        textConfig: {
          ...template.textConfig,
          [key]: value,
        },
      });
    },
    [template, onUpdateTemplate]
  );

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-2">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Select a template or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Template Name Display */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold">{template.name}</h2>
        <Button asChild variant="outline" size="sm">
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {template.baseplateDataUrl ? 'Change Template' : 'Upload Template'}
            <input
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </Button>
      </div>

      {/* Live Preview Canvas */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Live Preview</span>
            {template.baseplateDataUrl && (
              <span className="text-xs text-muted-foreground">
                Drag the green text box to reposition
              </span>
            )}
          </div>
          <TemplateCanvas
            baseplateUrl={template.baseplateDataUrl}
            textConfig={template.textConfig}
            sampleText={sampleEventName}
            onTextConfigChange={handleTextConfigChange}
          />
        </CardContent>
      </Card>

      {/* Text Configuration */}
      {template.baseplateDataUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <span className="text-sm font-medium">Text Settings</span>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={template.textConfig.fontFamily}
                  onValueChange={(value) => handleTextFieldChange('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size (px)</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min={12}
                  max={200}
                  value={template.textConfig.fontSize}
                  onChange={(e) => handleTextFieldChange('fontSize', parseInt(e.target.value) || 24)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={template.textConfig.color}
                    onChange={(e) => handleTextFieldChange('color', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={template.textConfig.color}
                    onChange={(e) => handleTextFieldChange('color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textAlign">Text Align</Label>
                <Select
                  value={template.textConfig.textAlign}
                  onValueChange={(value) => handleTextFieldChange('textAlign', value as CanvasTextAlign)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="x">X Position</Label>
                <Input
                  id="x"
                  type="number"
                  min={0}
                  value={template.textConfig.x}
                  onChange={(e) => handleTextFieldChange('x', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="y">Y Position</Label>
                <Input
                  id="y"
                  type="number"
                  min={0}
                  value={template.textConfig.y}
                  onChange={(e) => handleTextFieldChange('y', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWidth">Max Width</Label>
                <Input
                  id="maxWidth"
                  type="number"
                  min={50}
                  value={template.textConfig.maxWidth}
                  onChange={(e) => handleTextFieldChange('maxWidth', parseInt(e.target.value) || 300)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
