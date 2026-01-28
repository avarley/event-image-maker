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

export type FontWeight = '400' | '500' | '700' | '900';

export interface TextFieldConfig {
  showEventName: boolean;
  showDate: boolean;
  showLocation: boolean;
  showVenue: boolean;
  dateFormat: 'short' | 'long' | 'full'; // e.g., "Jan 15", "January 15, 2025", "Friday, January 15, 2025"
  dateOrdinal?: boolean;    // Add ordinal suffix: 7th, 1st, 2nd, 3rd
  dateUppercase?: boolean;  // Uppercase month: FEB instead of Feb
  locationFormat: 'city' | 'city-state' | 'city-country'; // e.g., "Austin", "Austin, TX", "Austin, USA"
  // Per-field font weights
  eventNameFontWeight?: FontWeight;
  dateFontWeight?: FontWeight;
  venueLocationFontWeight?: FontWeight;
  // Event name styling
  eventNameUppercase?: boolean;
}

export interface TextConfig {
  fontFamily: string;
  fontSize: number;
  eventNameFontSize?: number;
  color: string;
  x: number;
  y: number;
  maxWidth: number;
  textAlign: CanvasTextAlign;
  fields: TextFieldConfig;
  bottomShadowEnabled?: boolean;
  bottomShadowOpacity?: number;
  bottomShadowHeight?: number; // 0-100 percentage of canvas height
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

// Default field configuration
export const DEFAULT_TEXT_FIELDS: TextFieldConfig = {
  showEventName: true,
  showDate: false,
  showLocation: false,
  showVenue: false,
  dateFormat: 'long',
  dateOrdinal: false,
  dateUppercase: false,
  locationFormat: 'city-state',
  eventNameFontWeight: '700',
  dateFontWeight: '700',
  venueLocationFontWeight: '700',
  eventNameUppercase: false,
};
