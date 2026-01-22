import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, List } from 'lucide-react';
import { EventData } from '@/types/imageGenerator';

interface EventSelectorProps {
  events: EventData[];
  selectedEventIds: Set<string>;
  isLoading: boolean;
  feedUrl: string;
  onFeedUrlChange: (url: string) => void;
  onFetchEvents: () => void;
  onToggleEvent: (eventId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const EventSelector = ({
  events,
  selectedEventIds,
  isLoading,
  feedUrl,
  onFeedUrlChange,
  onFetchEvents,
  onToggleEvent,
  onSelectAll,
  onDeselectAll,
}: EventSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Event Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                {events.map((event) => (
                  <label
                    key={event.EVENT_ID}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedEventIds.has(event.EVENT_ID)}
                      onCheckedChange={() => onToggleEvent(event.EVENT_ID)}
                    />
                    <img
                      src={event.EVENT_IMAGE_SMALL_URL}
                      alt={event.EVENT_NAME}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.EVENT_NAME}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {event.VENUE_NAME} • {event.CITY_NAME}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};
