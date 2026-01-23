import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, RotateCcw } from 'lucide-react';
import { TextConfig, DEFAULT_TEXT_FIELDS } from '@/types/imageGenerator';

interface TextConfigPanelProps {
  textConfig: TextConfig;
  onTextConfigChange: (config: TextConfig) => void;
  baseplateWidth?: number;
  baseplateHeight?: number;
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

const DEFAULT_TEXT_CONFIG: TextConfig = {
  fontFamily: 'Roboto',
  fontSize: 56,
  color: '#ffffff',
  x: 540,
  y: 940,
  maxWidth: 550,
  textAlign: 'center',
  fields: DEFAULT_TEXT_FIELDS,
};

export const TextConfigPanel = ({
  textConfig,
  onTextConfigChange,
  baseplateWidth = 800,
  baseplateHeight = 600,
}: TextConfigPanelProps) => {
  const handleChange = (key: keyof TextConfig, value: string | number) => {
    onTextConfigChange({
      ...textConfig,
      [key]: value,
    });
  };

  const handleResetToDefaults = () => {
    onTextConfigChange(DEFAULT_TEXT_CONFIG);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Text Configuration
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select
              value={textConfig.fontFamily}
              onValueChange={(value) => handleChange('fontFamily', value)}
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
              value={textConfig.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 24)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={textConfig.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={textConfig.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textAlign">Text Align</Label>
            <Select
              value={textConfig.textAlign}
              onValueChange={(value) => handleChange('textAlign', value as CanvasTextAlign)}
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
              max={baseplateWidth}
              value={textConfig.x}
              onChange={(e) => handleChange('x', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="y">Y Position</Label>
            <Input
              id="y"
              type="number"
              min={0}
              max={baseplateHeight}
              value={textConfig.y}
              onChange={(e) => handleChange('y', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWidth">Max Width</Label>
            <Input
              id="maxWidth"
              type="number"
              min={50}
              max={baseplateWidth}
              value={textConfig.maxWidth}
              onChange={(e) => handleChange('maxWidth', parseInt(e.target.value) || 300)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
