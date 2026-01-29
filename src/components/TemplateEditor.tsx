import { useCallback, useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, Plus, Trash2, Save, FolderOpen, FlipHorizontal, FlipVertical, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { SavedTemplate, TextConfig, SavedOverlay, TextFieldConfig, DEFAULT_TEXT_FIELDS, FontWeight, OverlayPreset } from '@/types/imageGenerator';
import { TemplateCanvas } from './TemplateCanvas';
import { ImportOverlaysDialog } from './ImportOverlaysDialog';
import { compressImageFile, formatBytes, estimateDataUrlSize } from '@/utils/imageCompression';
import { toast } from 'sonner';

interface TemplateEditorProps {
  template: SavedTemplate | null;
  allTemplates: SavedTemplate[];
  onUpdateTemplate: (id: string, updates: Partial<SavedTemplate>) => void;
  sampleEventName?: string;
  eventImageAspectRatio?: number;
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
  'aktiv-grotesk-condensed',
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

const FONT_WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi-Bold' },
  { value: '700', label: 'Bold' },
  { value: '900', label: 'Black' },
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
  allTemplates,
  onUpdateTemplate,
  sampleEventName = 'Sample Event Name',
  eventImageAspectRatio,
}: TemplateEditorProps) => {
  const [showSafeZone, setShowSafeZone] = useState(false);
  
  // Undo/Redo state
  const [undoStack, setUndoStack] = useState<Partial<SavedTemplate>[]>([]);
  const [redoStack, setRedoStack] = useState<Partial<SavedTemplate>[]>([]);
  const isUndoingRef = useRef(false);
  const lastTemplateIdRef = useRef<string | null>(null);

  // Reset stacks when template changes
  useEffect(() => {
    if (template?.id !== lastTemplateIdRef.current) {
      setUndoStack([]);
      setRedoStack([]);
      lastTemplateIdRef.current = template?.id || null;
    }
  }, [template?.id]);

  // Wrap onUpdateTemplate to track history
  const updateTemplateWithHistory = useCallback(
    (id: string, updates: Partial<SavedTemplate>) => {
      if (!template || isUndoingRef.current) {
        onUpdateTemplate(id, updates);
        return;
      }

      // Save current state to undo stack
      const currentState: Partial<SavedTemplate> = {
        textConfig: template.textConfig,
        textEnabled: template.textEnabled,
        overlays: template.overlays,
      };
      
      setUndoStack(prev => [...prev.slice(-49), currentState]);
      setRedoStack([]); // Clear redo stack on new action
      onUpdateTemplate(id, updates);
    },
    [template, onUpdateTemplate]
  );

  const handleUndo = useCallback(() => {
    if (!template || undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const currentState: Partial<SavedTemplate> = {
      textConfig: template.textConfig,
      textEnabled: template.textEnabled,
      overlays: template.overlays,
    };
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);
    
    isUndoingRef.current = true;
    onUpdateTemplate(template.id, previousState);
    isUndoingRef.current = false;
    
    toast.success('Undone');
  }, [template, undoStack, onUpdateTemplate]);

  const handleRedo = useCallback(() => {
    if (!template || redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const currentState: Partial<SavedTemplate> = {
      textConfig: template.textConfig,
      textEnabled: template.textEnabled,
      overlays: template.overlays,
    };
    
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentState]);
    
    isUndoingRef.current = true;
    onUpdateTemplate(template.id, nextState);
    isUndoingRef.current = false;
    
    toast.success('Redone');
  }, [template, redoStack, onUpdateTemplate]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (modifierKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if (modifierKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!template) return;
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const originalSize = file.size;
        const compressedDataUrl = await compressImageFile(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.85,
        });
        const compressedSize = estimateDataUrlSize(compressedDataUrl);
        
        const img = new Image();
        img.onload = () => {
          onUpdateTemplate(template.id, {
            baseplateDataUrl: compressedDataUrl,
            textConfig: {
              ...template.textConfig,
              x: Math.floor(img.width / 2),
              maxWidth: img.width - 100,
            },
          });
          
          if (compressedSize < originalSize) {
            toast.success(`Template compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`);
          }
        };
        img.src = compressedDataUrl;
      } catch (error) {
        console.error('Failed to compress image:', error);
        toast.error('Failed to process image');
      }
    },
    [template, onUpdateTemplate]
  );

  const handleTextConfigChange = useCallback(
    (textConfig: TextConfig) => {
      if (!template) return;
      updateTemplateWithHistory(template.id, { textConfig });
    },
    [template, updateTemplateWithHistory]
  );

  const handleTextFieldChange = useCallback(
    (key: keyof TextConfig, value: string | number | boolean) => {
      if (!template) return;
      updateTemplateWithHistory(template.id, {
        textConfig: {
          ...template.textConfig,
          [key]: value,
        },
      });
    },
    [template, updateTemplateWithHistory]
  );

  const handleFieldToggle = useCallback(
    (fieldKey: keyof TextFieldConfig, value: boolean | string | number) => {
      if (!template) return;
      const currentFields = template.textConfig.fields || DEFAULT_TEXT_FIELDS;
      updateTemplateWithHistory(template.id, {
        textConfig: {
          ...template.textConfig,
          fields: {
            ...currentFields,
            [fieldKey]: value,
          },
        },
      });
    },
    [template, updateTemplateWithHistory]
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
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!template) return;
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const originalSize = file.size;
        // Aggressive compression for overlays
        const compressedDataUrl = await compressImageFile(file, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.6,
        });
        const compressedSize = estimateDataUrlSize(compressedDataUrl);
        
        const img = new Image();
        img.onload = () => {
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
          
          const existingOverlays = template.overlays || [];
          const newOverlay: SavedOverlay = {
            id: crypto.randomUUID(),
            name: `Overlay ${existingOverlays.length + 1}`,
            dataUrl: compressedDataUrl,
            x,
            y,
            width: Math.round(width),
            height: Math.round(height),
            layer: 'above',
            rotation: 0,
            flipHorizontal: false,
            flipVertical: false,
          };

          onUpdateTemplate(template.id, {
            overlays: [...(template.overlays || []), newOverlay],
          });
          
          if (compressedSize < originalSize) {
            toast.success(`Overlay compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`);
          }
        };
        img.src = compressedDataUrl;
      } catch (error) {
        console.error('Failed to compress overlay:', error);
        toast.error('Failed to process overlay');
      }
      
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
      updateTemplateWithHistory(template.id, { overlays });
    },
    [template, updateTemplateWithHistory]
  );

  // Overlay Preset Management
  const handleSaveAsPreset = useCallback(() => {
    if (!template) return;
    const currentOverlays = template.overlays || [];
    if (currentOverlays.length === 0) {
      toast.error('No overlays to save');
      return;
    }
    
    const presetName = prompt('Enter a name for this overlay preset:');
    if (!presetName?.trim()) return;
    
    const newPreset: OverlayPreset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      overlays: JSON.parse(JSON.stringify(currentOverlays)), // Deep clone
    };
    
    const existingPresets = template.overlayPresets || [];
    onUpdateTemplate(template.id, {
      overlayPresets: [...existingPresets, newPreset],
      activePresetId: newPreset.id,
    });
    toast.success(`Preset "${presetName}" saved`);
  }, [template, onUpdateTemplate]);

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      if (!template) return;
      const presets = template.overlayPresets || [];
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;
      
      onUpdateTemplate(template.id, {
        overlays: JSON.parse(JSON.stringify(preset.overlays)), // Deep clone
        activePresetId: presetId,
      });
      toast.success(`Loaded preset "${preset.name}"`);
    },
    [template, onUpdateTemplate]
  );

  const handleDeletePreset = useCallback(
    (presetId: string) => {
      if (!template) return;
      const presets = template.overlayPresets || [];
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;
      
      if (!confirm(`Delete preset "${preset.name}"?`)) return;
      
      const updatedPresets = presets.filter((p) => p.id !== presetId);
      onUpdateTemplate(template.id, {
        overlayPresets: updatedPresets,
        activePresetId: template.activePresetId === presetId ? null : template.activePresetId,
      });
      toast.success(`Deleted preset "${preset.name}"`);
    },
    [template, onUpdateTemplate]
  );

  const handleClearOverlays = useCallback(() => {
    if (!template) return;
    onUpdateTemplate(template.id, { 
      overlays: [],
      activePresetId: null,
    });
  }, [template, onUpdateTemplate]);

  const handleImportOverlays = useCallback((overlays: SavedOverlay[]) => {
    if (!template) return;
    onUpdateTemplate(template.id, {
      overlays: [...(template.overlays || []), ...overlays],
    });
  }, [template, onUpdateTemplate]);


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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Live Preview</span>
              {template.baseplateDataUrl && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    title="Undo (⌘Z)"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    title="Redo (⌘⇧Z)"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {template.baseplateDataUrl && (
                <>
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
            eventImageAspectRatio={eventImageAspectRatio}
          />
        </CardContent>
      </Card>

      {/* Overlays Management */}
      {template.baseplateDataUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overlays</span>
              <div className="flex items-center gap-2">
                <ImportOverlaysDialog
                  currentTemplate={template}
                  allTemplates={allTemplates}
                  onImportOverlays={handleImportOverlays}
                />
                {(template.overlays || []).length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSaveAsPreset}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preset
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClearOverlays}>
                      Clear All
                    </Button>
                  </>
                )}
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
            </div>

            {/* Saved Presets */}
            {(template.overlayPresets || []).length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Saved Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {(template.overlayPresets || []).map((preset) => (
                    <div
                      key={preset.id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                        template.activePresetId === preset.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                    >
                      <button
                        onClick={() => handleLoadPreset(preset.id)}
                        className="flex items-center gap-1"
                      >
                        <FolderOpen className="h-3 w-3" />
                        {preset.name}
                        <span className="text-xs opacity-70">({preset.overlays.length})</span>
                      </button>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="ml-1 opacity-50 hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(template.overlays || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No overlays added. Upload an image to layer on top of or below the event image.
              </p>
            ) : (
              <div className="space-y-2">
                {(template.overlays || []).map((overlay) => (
                  <div
                    key={overlay.id}
                    className="flex items-center gap-3 p-2 border rounded-lg bg-background"
                  >
                    <img
                      src={overlay.dataUrl}
                      alt={overlay.name}
                      className="w-12 h-12 object-contain rounded border bg-muted"
                    />
                    <Input
                      value={overlay.name}
                      onChange={(e) => {
                        const updatedOverlays = (template.overlays || []).map((o) =>
                          o.id === overlay.id ? { ...o, name: e.target.value } : o
                        );
                        onUpdateTemplate(template.id, { overlays: updatedOverlays });
                      }}
                      className="flex-1 h-8 text-sm"
                    />
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
                      variant={overlay.flipHorizontal ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => {
                        const updatedOverlays = (template.overlays || []).map((o) =>
                          o.id === overlay.id ? { ...o, flipHorizontal: !o.flipHorizontal } : o
                        );
                        onUpdateTemplate(template.id, { overlays: updatedOverlays });
                      }}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={overlay.flipVertical ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => {
                        const updatedOverlays = (template.overlays || []).map((o) =>
                          o.id === overlay.id ? { ...o, flipVertical: !o.flipVertical } : o
                        );
                        onUpdateTemplate(template.id, { overlays: updatedOverlays });
                      }}
                      title="Flip Vertical"
                    >
                      <FlipVertical className="h-4 w-4" />
                    </Button>
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
                  <div className="space-y-4">
                    {/* Event Name */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 min-w-32">
                        <Switch
                          id="showEventName"
                          checked={textFields.showEventName}
                          onCheckedChange={(checked) => handleFieldToggle('showEventName', checked)}
                        />
                        <Label htmlFor="showEventName" className="text-sm">Event Name</Label>
                      </div>
                      {textFields.showEventName && (
                        <>
                          <Select
                            value={textFields.eventNameFontFamily || 'aktiv-grotesk-condensed'}
                            onValueChange={(value) => handleFieldToggle('eventNameFontFamily', value)}
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_FAMILIES.map((font) => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                  {font}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={textFields.eventNameFontWeight || '700'}
                            onValueChange={(value) => handleFieldToggle('eventNameFontWeight', value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_WEIGHTS.map((fw) => (
                                <SelectItem key={fw.value} value={fw.value}>{fw.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="eventNameUppercase"
                              checked={textFields.eventNameUppercase ?? false}
                              onCheckedChange={(checked) => handleFieldToggle('eventNameUppercase', checked === true)}
                            />
                            <Label htmlFor="eventNameUppercase" className="text-sm">UPPERCASE</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Spacing:</Label>
                            <Input
                              type="number"
                              min={-10}
                              max={20}
                              value={textFields.eventNameLetterSpacing ?? 0}
                              onChange={(e) => handleFieldToggle('eventNameLetterSpacing', parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-xs"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 min-w-32">
                        <Switch
                          id="showDate"
                          checked={textFields.showDate}
                          onCheckedChange={(checked) => handleFieldToggle('showDate', checked)}
                        />
                        <Label htmlFor="showDate" className="text-sm">Date</Label>
                      </div>
                      {textFields.showDate && (
                        <>
                          <Select
                            value={textFields.dateFontFamily || 'aktiv-grotesk-condensed'}
                            onValueChange={(value) => handleFieldToggle('dateFontFamily', value)}
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_FAMILIES.map((font) => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                  {font}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={textFields.dateFontWeight || '700'}
                            onValueChange={(value) => handleFieldToggle('dateFontWeight', value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_WEIGHTS.map((fw) => (
                                <SelectItem key={fw.value} value={fw.value}>{fw.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Spacing:</Label>
                            <Input
                              type="number"
                              min={-10}
                              max={20}
                              value={textFields.dateLetterSpacing ?? 0}
                              onChange={(e) => handleFieldToggle('dateLetterSpacing', parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="dateFullUppercase"
                              checked={textFields.dateFullUppercase ?? false}
                              onCheckedChange={(checked) => handleFieldToggle('dateFullUppercase', checked === true)}
                            />
                            <Label htmlFor="dateFullUppercase" className="text-sm">UPPERCASE</Label>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Venue */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 min-w-32">
                        <Switch
                          id="showVenue"
                          checked={textFields.showVenue}
                          onCheckedChange={(checked) => handleFieldToggle('showVenue', checked)}
                        />
                        <Label htmlFor="showVenue" className="text-sm">Venue</Label>
                      </div>
                      {(textFields.showVenue || textFields.showLocation) && !textFields.showLocation && (
                        <Select
                          value={textFields.venueLocationFontWeight || '700'}
                          onValueChange={(value) => handleFieldToggle('venueLocationFontWeight', value)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHTS.map((fw) => (
                              <SelectItem key={fw.value} value={fw.value}>{fw.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 min-w-32">
                        <Switch
                          id="showLocation"
                          checked={textFields.showLocation}
                          onCheckedChange={(checked) => handleFieldToggle('showLocation', checked)}
                        />
                        <Label htmlFor="showLocation" className="text-sm">Location</Label>
                      </div>
                      {(textFields.showVenue || textFields.showLocation) && (
                        <>
                          <Select
                            value={textFields.venueLocationFontFamily || 'aktiv-grotesk-condensed'}
                            onValueChange={(value) => handleFieldToggle('venueLocationFontFamily', value)}
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_FAMILIES.map((font) => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                  {font}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={textFields.venueLocationFontWeight || '700'}
                            onValueChange={(value) => handleFieldToggle('venueLocationFontWeight', value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_WEIGHTS.map((fw) => (
                                <SelectItem key={fw.value} value={fw.value}>{fw.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Spacing:</Label>
                            <Input
                              type="number"
                              min={-10}
                              max={20}
                              value={textFields.venueLocationLetterSpacing ?? 0}
                              onChange={(e) => handleFieldToggle('venueLocationLetterSpacing', parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="venueLocationUppercase"
                              checked={textFields.venueLocationUppercase ?? false}
                              onCheckedChange={(checked) => handleFieldToggle('venueLocationUppercase', checked === true)}
                            />
                            <Label htmlFor="venueLocationUppercase" className="text-sm">UPPERCASE</Label>
                          </div>
                        </>
                      )}
                      {(textFields.showVenue && textFields.showLocation) && (
                        <span className="text-xs text-muted-foreground">(shared with Venue)</span>
                      )}
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
                    <div className="space-y-4 pl-6 max-w-xs">
                      <div className="space-y-2">
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shadowHeight" className="text-sm">Height</Label>
                          <span className="text-sm text-muted-foreground">
                            {template.textConfig.bottomShadowHeight ?? 33}%
                          </span>
                        </div>
                        <Slider
                          id="shadowHeight"
                          min={10}
                          max={100}
                          step={5}
                          value={[template.textConfig.bottomShadowHeight ?? 33]}
                          onValueChange={([value]) => handleTextFieldChange('bottomShadowHeight', value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Image Frame Settings */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Event Image Frame</Label>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="eventImageWidth" className="text-sm">Width</Label>
                        <span className="text-sm text-muted-foreground">
                          {template.textConfig.eventImageWidth ?? 80}%
                        </span>
                      </div>
                      <Slider
                        id="eventImageWidth"
                        min={10}
                        max={100}
                        step={5}
                        value={[template.textConfig.eventImageWidth ?? 80]}
                        onValueChange={([value]) => handleTextFieldChange('eventImageWidth', value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="eventImageHeight" className="text-sm">Height</Label>
                        <span className="text-sm text-muted-foreground">
                          {template.textConfig.eventImageHeight ?? 50}%
                        </span>
                      </div>
                      <Slider
                        id="eventImageHeight"
                        min={10}
                        max={100}
                        step={5}
                        value={[template.textConfig.eventImageHeight ?? 50]}
                        onValueChange={([value]) => handleTextFieldChange('eventImageHeight', value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="eventImageX" className="text-sm">Horizontal Position</Label>
                        <span className="text-sm text-muted-foreground">
                          {template.textConfig.eventImageX ?? 50}%
                        </span>
                      </div>
                      <Slider
                        id="eventImageX"
                        min={0}
                        max={100}
                        step={1}
                        value={[template.textConfig.eventImageX ?? 50]}
                        onValueChange={([value]) => handleTextFieldChange('eventImageX', value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="eventImageY" className="text-sm">Vertical Position</Label>
                        <span className="text-sm text-muted-foreground">
                          {template.textConfig.eventImageY ?? 30}%
                        </span>
                      </div>
                      <Slider
                        id="eventImageY"
                        min={0}
                        max={100}
                        step={1}
                        value={[template.textConfig.eventImageY ?? 30]}
                        onValueChange={([value]) => handleTextFieldChange('eventImageY', value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-w-xs">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="eventImageBorderRadius" className="text-sm">Corner Radius</Label>
                      <span className="text-sm text-muted-foreground">
                        {template.textConfig.eventImageBorderRadius ?? 0}px
                      </span>
                    </div>
                    <Slider
                      id="eventImageBorderRadius"
                      min={0}
                      max={100}
                      step={5}
                      value={[template.textConfig.eventImageBorderRadius ?? 0]}
                      onValueChange={([value]) => handleTextFieldChange('eventImageBorderRadius', value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lineHeight">Line Height</Label>
                      <span className="text-sm text-muted-foreground">
                        {(template.textConfig.lineHeight ?? 1.2).toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      id="lineHeight"
                      min={80}
                      max={200}
                      step={5}
                      value={[Math.round((template.textConfig.lineHeight ?? 1.2) * 100)]}
                      onValueChange={([value]) => handleTextFieldChange('lineHeight', value / 100)}
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
