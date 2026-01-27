import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateList } from '@/components/TemplateList';
import { TemplateEditor } from '@/components/TemplateEditor';
import { EventSelector } from '@/components/EventSelector';
import { ImagePreview } from '@/components/ImagePreview';
import { useTemplateStorage } from '@/hooks/useTemplateStorage';
import { useImageGenerator } from '@/hooks/useImageGenerator';
import {
  EventData,
  TemplateConfig,
  GeneratedImage,
  SavedTemplate,
  OverlayConfig,
} from '@/types/imageGenerator';

const DEFAULT_FEED_URL = 'https://growthbook-tixel.s3.ap-southeast-2.amazonaws.com/tixel-tuesdays/top-events.json';

const Index = () => {
  const {
    templates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useTemplateStorage();

  const [feedUrl, setFeedUrl] = useState(DEFAULT_FEED_URL);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const { generateImage } = useImageGenerator();

  // Get sample event name for preview
  const sampleEventName = useMemo(() => {
    const firstSelectedEvent = events.find((e) => selectedEventIds.has(e.EVENT_ID));
    return firstSelectedEvent?.EVENT_NAME || 'Sample Event Name';
  }, [events, selectedEventIds]);

  // Compute event image aspect ratio for preview
  const [eventImageAspectRatio, setEventImageAspectRatio] = useState<number | undefined>();

  useEffect(() => {
    const firstSelectedEvent = events.find((e) => selectedEventIds.has(e.EVENT_ID));
    if (firstSelectedEvent) {
      const img = new Image();
      img.onload = () => {
        setEventImageAspectRatio(img.width / img.height);
      };
      // Use custom image if overridden, otherwise the large URL
      const imageUrl = imageOverrides[firstSelectedEvent.EVENT_ID] 
        || firstSelectedEvent.EVENT_IMAGE_LARGE_URL;
      img.src = imageUrl.startsWith('http') 
        ? `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`
        : imageUrl;
    } else {
      setEventImageAspectRatio(undefined);
    }
  }, [events, selectedEventIds, imageOverrides]);

  const handleRenameTemplate = useCallback(
    (id: string, name: string) => {
      updateTemplate(id, { name });
    },
    [updateTemplate]
  );

  const fetchEvents = useCallback(async () => {
    if (!feedUrl) return;

    setIsLoadingEvents(true);
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      setEvents(data);
      toast.success(`Loaded ${data.length} events`);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events. Check the URL and try again.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [feedUrl]);

  const toggleEvent = useCallback((eventId: string) => {
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  const selectAllEvents = useCallback(() => {
    setSelectedEventIds(new Set(events.map((e) => e.EVENT_ID)));
  }, [events]);

  const deselectAllEvents = useCallback(() => {
    setSelectedEventIds(new Set());
  }, []);

  const handleImageOverride = useCallback((eventId: string, dataUrl: string | null) => {
    setImageOverrides((prev) => {
      if (dataUrl === null) {
        const next = { ...prev };
        delete next[eventId];
        return next;
      }
      return { ...prev, [eventId]: dataUrl };
    });
  }, []);

  const toggleTemplateForGeneration = useCallback((templateId: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  }, []);

  const selectAllTemplates = useCallback(() => {
    setSelectedTemplateIds(new Set(templates.filter((t) => t.baseplateDataUrl).map((t) => t.id)));
  }, [templates]);

  const deselectAllTemplates = useCallback(() => {
    setSelectedTemplateIds(new Set());
  }, []);

  // Convert SavedTemplate to TemplateConfig for image generation
  const createTemplateConfig = useCallback(async (savedTemplate: SavedTemplate): Promise<TemplateConfig | null> => {
    if (!savedTemplate.baseplateDataUrl) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        // Load overlay images
        const overlayConfigs = await Promise.all(
          (savedTemplate.overlays || []).map(async (overlay) => {
            return new Promise<OverlayConfig | null>((resolveOverlay) => {
              const overlayImg = new Image();
              overlayImg.onload = () => {
                resolveOverlay({
                  id: overlay.id,
                  image: overlayImg,
                  x: overlay.x,
                  y: overlay.y,
                  width: overlay.width,
                  height: overlay.height,
                  layer: overlay.layer,
                });
              };
              overlayImg.onerror = () => resolveOverlay(null);
              overlayImg.src = overlay.dataUrl;
            });
          })
        );

        resolve({
          baseplate: img,
          baseplateUrl: savedTemplate.baseplateDataUrl,
          textConfig: savedTemplate.textConfig,
          textEnabled: savedTemplate.textEnabled ?? true,
          overlays: overlayConfigs.filter((o): o is OverlayConfig => o !== null),
        });
      };
      img.onerror = () => resolve(null);
      img.src = savedTemplate.baseplateDataUrl;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedTemplateIds.size === 0) {
      toast.error('Please select at least one template');
      return;
    }

    if (selectedEventIds.size === 0) {
      toast.error('Please select at least one event');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    const selectedEvents = events.filter((e) => selectedEventIds.has(e.EVENT_ID));
    const selectedTemplates = templates.filter((t) => selectedTemplateIds.has(t.id));
    const results: GeneratedImage[] = [];

    for (const template of selectedTemplates) {
      const templateConfig = await createTemplateConfig(template);
      if (!templateConfig) continue;

      for (const event of selectedEvents) {
        const customImageUrl = imageOverrides[event.EVENT_ID];
        const result = await generateImage(event, templateConfig, customImageUrl);
        if (result) {
          results.push({
            ...result,
            templateId: template.id,
            templateName: template.name,
          });
          setGeneratedImages([...results]);
        }
      }
    }

    setIsGenerating(false);
    toast.success(`Generated ${results.length} images`);
  }, [selectedTemplateIds, selectedEventIds, events, templates, createTemplateConfig, generateImage, imageOverrides]);

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `${image.templateName.replace(/[^a-z0-9]/gi, '_')}_${image.eventName.replace(/[^a-z0-9]/gi, '_')}_${image.eventId}.png`;
    link.click();
    toast.success(`Downloaded ${image.eventName}`);
  }, []);

  const validTemplatesCount = templates.filter((t) => t.baseplateDataUrl).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 border-b">
        <div className="max-w-7xl mx-auto text-center space-y-2">
          <h1 className="text-4xl font-bold">Bulk Image Generator</h1>
          <p className="text-muted-foreground">
            Generate promotional images by combining your templates with event data
          </p>
        </div>
      </div>

      <Tabs defaultValue="template" className="max-w-7xl mx-auto p-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="template">
            1. Templates {templates.length > 0 && `(${templates.length})`}
          </TabsTrigger>
          <TabsTrigger value="events">
            2. Events {selectedEventIds.size > 0 && `(${selectedEventIds.size})`}
          </TabsTrigger>
          <TabsTrigger value="generate">3. Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-0">
          <div className="flex h-[calc(100vh-280px)] min-h-[500px] border rounded-lg overflow-hidden">
            <div className="w-64 flex-shrink-0">
              <TemplateList
                templates={templates}
                activeTemplateId={activeTemplateId}
                onSelectTemplate={setActiveTemplateId}
                onCreateTemplate={createTemplate}
                onDeleteTemplate={deleteTemplate}
                onDuplicateTemplate={duplicateTemplate}
                onRenameTemplate={handleRenameTemplate}
              />
            </div>
            <TemplateEditor
              template={activeTemplate}
              onUpdateTemplate={updateTemplate}
              sampleEventName={sampleEventName}
              eventImageAspectRatio={eventImageAspectRatio}
            />
          </div>
        </TabsContent>

        <TabsContent value="events">
          <EventSelector
            events={events}
            selectedEventIds={selectedEventIds}
            isLoading={isLoadingEvents}
            feedUrl={feedUrl}
            imageOverrides={imageOverrides}
            onFeedUrlChange={setFeedUrl}
            onFetchEvents={fetchEvents}
            onToggleEvent={toggleEvent}
            onSelectAll={selectAllEvents}
            onDeselectAll={deselectAllEvents}
            onImageOverride={handleImageOverride}
          />
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          {/* Template Selection for Generation */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Select Templates to Generate</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllTemplates}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllTemplates}>
                  Deselect All
                </Button>
              </div>
            </div>

            {validTemplatesCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                No valid templates. Upload a template image first.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {templates
                  .filter((t) => t.baseplateDataUrl)
                  .map((template) => (
                    <label
                      key={template.id}
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedTemplateIds.has(template.id)}
                        onCheckedChange={() => toggleTemplateForGeneration(template.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="aspect-video rounded bg-muted mb-1 overflow-hidden">
                          <img
                            src={template.baseplateDataUrl}
                            alt={template.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium truncate block">{template.name}</span>
                      </div>
                    </label>
                  ))}
              </div>
            )}
          </div>

          {/* Summary and Generate Button */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              {selectedTemplateIds.size} template{selectedTemplateIds.size !== 1 ? 's' : ''} ×{' '}
              {selectedEventIds.size} event{selectedEventIds.size !== 1 ? 's' : ''} ={' '}
              <strong>{selectedTemplateIds.size * selectedEventIds.size} images</strong>
            </p>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || selectedTemplateIds.size === 0 || selectedEventIds.size === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate {selectedTemplateIds.size * selectedEventIds.size} Image
                  {selectedTemplateIds.size * selectedEventIds.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          <ImagePreview
            generatedImages={generatedImages}
            isGenerating={isGenerating}
            onDownload={handleDownload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
