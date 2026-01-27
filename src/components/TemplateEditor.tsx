import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { SavedTemplate, TextConfig, SavedOverlay, TextFieldConfig, DEFAULT_TEXT_FIELDS } from '@/types/imageGenerator';
import { TemplateCanvas } from './TemplateCanvas';

interface TemplateEditorProps {
  template: SavedTemplate | null;
  onUpdateTemplate: (id: string, updates: Partial<SavedTemplate>) => void;
  sampleEventName?: string;
}

const DEFAULT_TEXT_CONFIG: TextConfig = {
  fontFamily: 'Roboto',
  fontSize: 56,
  eventNameFontSize: 56,
  color: '#ffffff',
  x: 540,
  y: 940,
  maxWidth: 550,
  textAlign: 'center',
  fields: DEFAULT_TEXT_FIELDS,
  bottomShadowEnabled: false,
  bottomShadowOpacity: 0.5,
};

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

// Sample data for preview (Australian date format)
const SAMPLE_EVENT = {
  name: 'Sample Event Name',
  date: '15 January 2025',
  location: 'Austin, TX',
  venue: 'Main Stage Arena',
};

export const TemplateEditor = ({
  template,
  onUpdateTemplate,
  sampleEventName = 'Sample Event Name',
}: TemplateEditorProps) => {
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [showEventImageOverlay, setShowEventImageOverlay] = useState(false);

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
    (key: keyof TextConfig, value: string | number | boolean) => {
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

  const handleFieldToggle = useCallback(
    (fieldKey: keyof TextFieldConfig, value: boolean | string) => {
      if (!template) return;
      const currentFields = template.textConfig.fields || DEFAULT_TEXT_FIELDS;
      onUpdateTemplate(template.id, {
        textConfig: {
          ...template.textConfig,
          fields: {
            ...currentFields,
            [fieldKey]: value,
          },
        },
      });
    },
    [template, onUpdateTemplate]
  );

  const handleResetToDefaults = useCallback(() => {
    if (!template) return;
    
    if (template.baseplateDataUrl) {
      const img = new Image();
      img.onload = () => {
        onUpdateTemplate(template.id, {
          textConfig: {
            ...DEFAULT_TEXT_CONFIG,
            x: Math.floor(img.width / 2),
          },
        });
      };
      img.src = template.baseplateDataUrl;
    } else {
      onUpdateTemplate(template.id, { textConfig: DEFAULT_TEXT_CONFIG });
    }
  }, [template, onUpdateTemplate]);

  const handleOverlayUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!template) return;
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const dataUrl = event.target?.result as string;
          
          // Scale to fit within 30% of template width
          let baseplateWidth = 1080; // default
          if (template.baseplateDataUrl) {
            const baseplateImg = new Image();
            baseplateImg.src = template.baseplateDataUrl;
            baseplateWidth = baseplateImg.width || 1080;
          }
          
          const maxOverlayWidth = baseplateWidth * 0.3;
          const aspectRatio = img.width / img.height;
          const width = Math.min(img.width, maxOverlayWidth);
          const height = width / aspectRatio;
          
          // Center the overlay
          const x = Math.floor((baseplateWidth - width) / 2);
          const y = 100;
          
          const newOverlay: SavedOverlay = {
            id: crypto.randomUUID(),
            dataUrl,
            x,
            y,
            width: Math.round(width),
            height: Math.round(height),
            layer: 'above',
          };

          onUpdateTemplate(template.id, {
            overlays: [...(template.overlays || []), newOverlay],
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Reset input so same file can be uploaded again
      e.target.value = '';
    },
    [template, onUpdateTemplate]
  );

  const handleOverlayLayerChange = useCallback(
    (overlayId: string, layer: 'above' | 'below') => {
      if (!template) return;
      const updatedOverlays = (template.overlays || []).map((o) =>
        o.id === overlayId ? { ...o, layer } : o
      );
      onUpdateTemplate(template.id, { overlays: updatedOverlays });
    },
    [template, onUpdateTemplate]
  );

  const handleDeleteOverlay = useCallback(
    (overlayId: string) => {
      if (!template) return;
      const updatedOverlays = (template.overlays || []).filter((o) => o.id !== overlayId);
      onUpdateTemplate(template.id, { overlays: updatedOverlays });
    },
    [template, onUpdateTemplate]
  );

  const handleOverlaysChange = useCallback(
    (overlays: SavedOverlay[]) => {
      if (!template) return;
      onUpdateTemplate(template.id, { overlays });
    },
    [template, onUpdateTemplate]
  );

  // Build preview text based on enabled fields
  const getPreviewText = useCallback(() => {
    if (!template) return sampleEventName;
    const fields = template.textConfig.fields || DEFAULT_TEXT_FIELDS;
    const lines: string[] = [];
    
    if (fields.showEventName) lines.push(sampleEventName || SAMPLE_EVENT.name);
    if (fields.showDate) lines.push(SAMPLE_EVENT.date);
    
    // Concatenate venue and location
    const venuePart = fields.showVenue ? SAMPLE_EVENT.venue : '';
    const locationPart = fields.showLocation ? SAMPLE_EVENT.location : '';
    if (venuePart && locationPart) {
      lines.push(`${venuePart}, ${locationPart}`);
    } else if (venuePart) {
      lines.push(venuePart);
    } else if (locationPart) {
      lines.push(locationPart);
    }
    
    return lines.join('\n') || 'No fields selected';
  }, [template, sampleEventName]);

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

  const textFields = template.textConfig.fields || DEFAULT_TEXT_FIELDS;

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
            <div className="flex items-center gap-4">
              {template.baseplateDataUrl && (
                <>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="showEventImage"
                      checked={showEventImageOverlay}
                      onCheckedChange={setShowEventImageOverlay}
                    />
                    <Label htmlFor="showEventImage" className="text-sm">Show Event Image</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="showSafeZone"
                      checked={showSafeZone}
                      onCheckedChange={setShowSafeZone}
                    />
                    <Label htmlFor="showSafeZone" className="text-sm">Show Safe Zones</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Drag elements to reposition
                  </span>
                </>
              )}
            </div>
          </div>
          <TemplateCanvas
            baseplateUrl={template.baseplateDataUrl}
            textConfig={template.textConfig}
            textEnabled={template.textEnabled ?? true}
            sampleText={getPreviewText()}
            overlays={template.overlays || []}
            onTextConfigChange={handleTextConfigChange}
            onOverlaysChange={handleOverlaysChange}
            showSafeZone={showSafeZone}
            showEventImageOverlay={showEventImageOverlay}
          />
        </CardContent>
      </Card>

      {/* Overlays Management */}
      {template.baseplateDataUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overlays</span>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Overlay
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleOverlayUpload}
                  />
                </label>
              </Button>
            </div>

            {(template.overlays || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No overlays added. Upload an image to layer on top of or below the event image.
              </p>
            ) : (
              <div className="space-y-2">
                {(template.overlays || []).map((overlay, index) => (
                  <div
                    key={overlay.id}
                    className="flex items-center gap-3 p-2 border rounded-lg bg-background"
                  >
                    <img
                      src={overlay.dataUrl}
                      alt={`Overlay ${index + 1}`}
                      className="w-12 h-12 object-contain rounded border bg-muted"
                    />
                    <span className="text-sm flex-1 truncate">
                      Overlay {index + 1}
                    </span>
                    <Select
                      value={overlay.layer}
                      onValueChange={(value) =>
                        handleOverlayLayerChange(overlay.id, value as 'above' | 'below')
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Below Image</SelectItem>
                        <SelectItem value="above">Above Image</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOverlay(overlay.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Text Configuration */}
      {template.baseplateDataUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Text Settings</span>
                <div className="flex items-center gap-2">
                  <Switch
                    id="textEnabled"
                    checked={template.textEnabled ?? true}
                    onCheckedChange={(checked) => onUpdateTemplate(template.id, { textEnabled: checked })}
                  />
                  <Label htmlFor="textEnabled" className="text-sm text-muted-foreground">
                    Show text overlay
                  </Label>
                </div>
              </div>
              {(template.textEnabled ?? true) && (
                <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            
            {(template.textEnabled ?? true) && (
              <>
                {/* Text Fields Toggles */}
                <div className="border rounded-lg p-4 space-y-3">
                  <span className="text-sm font-medium">Display Fields</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="showEventName"
                        checked={textFields.showEventName}
                        onCheckedChange={(checked) => handleFieldToggle('showEventName', checked)}
                      />
                      <Label htmlFor="showEventName" className="text-sm">Event Name</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="showDate"
                        checked={textFields.showDate}
                        onCheckedChange={(checked) => handleFieldToggle('showDate', checked)}
                      />
                      <Label htmlFor="showDate" className="text-sm">Date</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="showVenue"
                        checked={textFields.showVenue}
                        onCheckedChange={(checked) => handleFieldToggle('showVenue', checked)}
                      />
                      <Label htmlFor="showVenue" className="text-sm">Venue</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="showLocation"
                        checked={textFields.showLocation}
                        onCheckedChange={(checked) => handleFieldToggle('showLocation', checked)}
                      />
                      <Label htmlFor="showLocation" className="text-sm">Location</Label>
                    </div>
                  </div>

                  {/* Format options */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {textFields.showDate && (
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat" className="text-sm">Date Format</Label>
                        <Select
                          value={textFields.dateFormat}
                          onValueChange={(value) => handleFieldToggle('dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                        <SelectItem value="short">15 Jan</SelectItem>
                            <SelectItem value="long">15 January 2025</SelectItem>
                            <SelectItem value="full">Friday, 15 January 2025</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="dateOrdinal"
                              checked={textFields.dateOrdinal ?? false}
                              onCheckedChange={(checked) => handleFieldToggle('dateOrdinal', checked === true)}
                            />
                            <Label htmlFor="dateOrdinal" className="text-sm">Ordinal (7th)</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="dateUppercase"
                              checked={textFields.dateUppercase ?? false}
                              onCheckedChange={(checked) => handleFieldToggle('dateUppercase', checked === true)}
                            />
                            <Label htmlFor="dateUppercase" className="text-sm">Uppercase (FEB)</Label>
                          </div>
                        </div>
                      </div>
                    )}
                    {textFields.showLocation && (
                      <div className="space-y-2">
                        <Label htmlFor="locationFormat" className="text-sm">Location Format</Label>
                        <Select
                          value={textFields.locationFormat}
                          onValueChange={(value) => handleFieldToggle('locationFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="city">City only</SelectItem>
                            <SelectItem value="city-state">City, State</SelectItem>
                            <SelectItem value="city-country">City, Country</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Event Name Font Size - only shown when Event Name is enabled */}
                  {textFields.showEventName && (
                    <div className="pt-2">
                      <div className="space-y-2 max-w-xs">
                        <Label htmlFor="eventNameFontSize" className="text-sm">Event Name Size (px)</Label>
                        <Input
                          id="eventNameFontSize"
                          type="number"
                          min={12}
                          max={200}
                          value={template.textConfig.eventNameFontSize ?? template.textConfig.fontSize}
                          onChange={(e) => handleTextFieldChange('eventNameFontSize', parseInt(e.target.value) || 56)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Shadow Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="bottomShadow"
                      checked={template.textConfig.bottomShadowEnabled ?? false}
                      onCheckedChange={(checked) => handleTextFieldChange('bottomShadowEnabled', checked)}
                    />
                    <Label htmlFor="bottomShadow" className="text-sm">Bottom Shadow Gradient</Label>
                  </div>
                  
                  {template.textConfig.bottomShadowEnabled && (
                    <div className="space-y-2 pl-6 max-w-xs">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shadowOpacity" className="text-sm">Opacity</Label>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((template.textConfig.bottomShadowOpacity ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <Slider
                        id="shadowOpacity"
                        min={0}
                        max={100}
                        step={5}
                        value={[Math.round((template.textConfig.bottomShadowOpacity ?? 0.5) * 100)]}
                        onValueChange={([value]) => handleTextFieldChange('bottomShadowOpacity', value / 100)}
                      />
                    </div>
                  )}
                </div>

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
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
