import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, List, Upload, X } from 'lucide-react';
import { EventData } from '@/types/imageGenerator';
import { ImageCropModal } from './ImageCropModal';

interface EventSelectorProps {
  events: EventData[];
  selectedEventIds: Set<string>;
  isLoading: boolean;
  feedUrl: string;
  imageOverrides: Record<string, string>;
  onFeedUrlChange: (url: string) => void;
  onFetchEvents: () => void;
  onToggleEvent: (eventId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onImageOverride: (eventId: string, dataUrl: string | null) => void;
}

export const EventSelector = ({
  events,
  selectedEventIds,
  isLoading,
  feedUrl,
  imageOverrides,
  onFeedUrlChange,
  onFetchEvents,
  onToggleEvent,
  onSelectAll,
  onDeselectAll,
  onImageOverride,
}: EventSelectorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentEventIdRef = useRef<string | null>(null);
  
  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingCropImage, setPendingCropImage] = useState<string | null>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

  const handleUploadClick = (eventId: string) => {
    currentEventIdRef.current = eventId;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentEventIdRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (currentEventIdRef.current) {
        // Open crop modal instead of directly applying
        setPendingCropImage(dataUrl);
        setPendingEventId(currentEventIdRef.current);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (pendingEventId) {
      onImageOverride(pendingEventId, croppedDataUrl);
    }
    setPendingCropImage(null);
    setPendingEventId(null);
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
    setPendingCropImage(null);
    setPendingEventId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Event Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-2">
          <Input
            placeholder="Enter JSON feed URL..."
            value={feedUrl}
            onChange={(e) => onFeedUrlChange(e.target.value)}
            className="flex-1"
          />
          <Button onClick={onFetchEvents} disabled={isLoading || !feedUrl}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {events.length > 0 && (
          <>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {selectedEventIds.size} of {events.length} selected
              </span>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={onSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={onDeselectAll}>
                Deselect All
              </Button>
            </div>

            <ScrollArea className="h-64 rounded-md border">
              <div className="p-4 space-y-2">
                {events.map((event) => {
                  const hasOverride = !!imageOverrides[event.EVENT_ID];
                  const displayImage = imageOverrides[event.EVENT_ID] || event.EVENT_IMAGE_SMALL_URL;
                  
                  return (
                    <div
                      key={event.EVENT_ID}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedEventIds.has(event.EVENT_ID)}
                        onCheckedChange={() => onToggleEvent(event.EVENT_ID)}
                      />
                      <div className="relative group">
                        <img
                          src={displayImage}
                          alt={event.EVENT_NAME}
                          className={`w-10 h-10 rounded object-cover ${hasOverride ? 'ring-2 ring-primary' : ''}`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-black/50 rounded transition-opacity">
                          <button
                            onClick={() => handleUploadClick(event.EVENT_ID)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                            title="Upload custom image"
                          >
                            <Upload className="h-3 w-3 text-gray-700" />
                          </button>
                          {hasOverride && (
                            <button
                              onClick={() => onImageOverride(event.EVENT_ID, null)}
                              className="p-1 bg-white rounded hover:bg-gray-100"
                              title="Remove custom image"
                            >
                              <X className="h-3 w-3 text-gray-700" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.EVENT_NAME}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {event.VENUE_NAME} • {event.CITY_NAME}
                        </p>
                      </div>
                      {hasOverride && (
                        <span className="text-xs text-primary font-medium">Custom</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Crop Modal */}
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={handleCropClose}
          imageDataUrl={pendingCropImage || ''}
          onCropComplete={handleCropComplete}
        />
      </CardContent>
    </Card>
  );
};
