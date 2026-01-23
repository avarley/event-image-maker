export interface EventData {
  EVENT_ID: string;
  EVENT_NAME: string;
  EVENT_URL: string;
  STARTS_AT: string;
  CITY_NAME: string;
  ACTIVE_LISTINGS_COUNT: string;
  ARTIST_URL: string;
  COUNTRY_NAME: string;
  EVENT_IMAGE_LARGE_URL: string;
  EVENT_IMAGE_SMALL_URL: string;
  POPULARITY_SCORE: string;
  EVENT_CATEGORY: string;
  EVENT_BLURB: string;
  VENUE_NAME: string;
  STATE_CODE: string;
  WAITLISTS_LAST_7D: string;
  SOLD_LAST_7D: string;
  WAITLISTS_COUNT: string;
  PREFERRED_URL: string;
  PRIMARY_URL: string;
}

export interface TextConfig {
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  maxWidth: number;
  textAlign: CanvasTextAlign;
}

export interface OverlayConfig {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: 'below' | 'above'; // below = under event image, above = on top
}

export interface SavedOverlay {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: 'below' | 'above';
}

export interface TemplateConfig {
  baseplate: HTMLImageElement | null;
  baseplateUrl: string;
  textConfig: TextConfig;
  textEnabled: boolean;
  overlays: OverlayConfig[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  baseplateDataUrl: string;
  textConfig: TextConfig;
  textEnabled: boolean;
  overlays: SavedOverlay[];
  createdAt: number;
  updatedAt: number;
}

export interface GeneratedImage {
  eventId: string;
  eventName: string;
  templateId: string;
  templateName: string;
  dataUrl: string;
}
