import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateUpload } from '@/components/TemplateUpload';
import { TextConfigPanel } from '@/components/TextConfigPanel';
import { EventSelector } from '@/components/EventSelector';
import { ImagePreview } from '@/components/ImagePreview';
import { useTransparencyDetection } from '@/hooks/useTransparencyDetection';
import { useImageGenerator } from '@/hooks/useImageGenerator';
import {
  EventData,
  TemplateConfig,
  TextConfig,
  TransparentRegion,
  GeneratedImage,
} from '@/types/imageGenerator';

const DEFAULT_TEXT_CONFIG: TextConfig = {
  fontFamily: 'Arial',
  fontSize: 48,
  color: '#ffffff',
  x: 400,
  y: 50,
  maxWidth: 700,
  textAlign: 'center',
};

const DEFAULT_FEED_URL = 'https://growthbook-tixel.s3.ap-southeast-2.amazonaws.com/tixel-tuesdays/top-events.json';

const Index = () => {
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    baseplate: null,
    baseplateUrl: '',
    transparentRegion: null,
    textConfig: DEFAULT_TEXT_CONFIG,
    overlays: [],
  });

  const [feedUrl, setFeedUrl] = useState(DEFAULT_FEED_URL);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const { detectTransparentRegion } = useTransparencyDetection();
  const { generateImage } = useImageGenerator();

  const handleBaseplateChange = useCallback((image: HTMLImageElement, dataUrl: string) => {
    setTemplateConfig((prev) => ({
      ...prev,
      baseplate: image,
      baseplateUrl: dataUrl,
      textConfig: {
        ...prev.textConfig,
        x: Math.floor(image.width / 2),
        maxWidth: image.width - 100,
      },
    }));
  }, []);

  const handleTransparentRegionDetected = useCallback((region: TransparentRegion | null) => {
    setTemplateConfig((prev) => ({
      ...prev,
      transparentRegion: region,
    }));
    if (region) {
      toast.success('Transparent region detected!');
    } else {
      toast.warning('No transparent region found in the template');
    }
  }, []);

  const handleTextConfigChange = useCallback((textConfig: TextConfig) => {
    setTemplateConfig((prev) => ({
      ...prev,
      textConfig,
    }));
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!feedUrl) return;
    
    setIsLoadingEvents(true);
    try {
      // Use CORS proxy for external URLs
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

  const selectAll = useCallback(() => {
    setSelectedEventIds(new Set(events.map((e) => e.EVENT_ID)));
  }, [events]);

  const deselectAll = useCallback(() => {
    setSelectedEventIds(new Set());
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!templateConfig.baseplate || !templateConfig.transparentRegion) {
      toast.error('Please upload a template with a transparent region first');
      return;
    }

    if (selectedEventIds.size === 0) {
      toast.error('Please select at least one event');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    const selectedEvents = events.filter((e) => selectedEventIds.has(e.EVENT_ID));
    const results: GeneratedImage[] = [];

    for (const event of selectedEvents) {
      const result = await generateImage(event, templateConfig);
      if (result) {
        results.push(result);
        setGeneratedImages([...results]);
      }
    }

    setIsGenerating(false);
    toast.success(`Generated ${results.length} images`);
  }, [templateConfig, selectedEventIds, events, generateImage]);

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `${image.eventName.replace(/[^a-z0-9]/gi, '_')}_${image.eventId}.png`;
    link.click();
    toast.success(`Downloaded ${image.eventName}`);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Bulk Image Generator</h1>
          <p className="text-muted-foreground">
            Generate promotional images by combining your template with event data
          </p>
        </div>

        <Tabs defaultValue="template" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">1. Template</TabsTrigger>
            <TabsTrigger value="events">2. Events</TabsTrigger>
            <TabsTrigger value="generate">3. Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-6">
            <TemplateUpload
              baseplate={templateConfig.baseplate}
              transparentRegion={templateConfig.transparentRegion}
              onBaseplateChange={handleBaseplateChange}
              onTransparentRegionDetected={handleTransparentRegionDetected}
              detectTransparentRegion={detectTransparentRegion}
            />

            <TextConfigPanel
              textConfig={templateConfig.textConfig}
              onTextConfigChange={handleTextConfigChange}
              baseplateWidth={templateConfig.baseplate?.width}
              baseplateHeight={templateConfig.baseplate?.height}
            />
          </TabsContent>

          <TabsContent value="events">
            <EventSelector
              events={events}
              selectedEventIds={selectedEventIds}
              isLoading={isLoadingEvents}
              feedUrl={feedUrl}
              onFeedUrlChange={setFeedUrl}
              onFetchEvents={fetchEvents}
              onToggleEvent={toggleEvent}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
            />
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || !templateConfig.baseplate || selectedEventIds.size === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate {selectedEventIds.size} Image{selectedEventIds.size !== 1 ? 's' : ''}
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
    </div>
  );
};

export default Index;
