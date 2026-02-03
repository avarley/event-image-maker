import { TextConfig, SavedOverlay } from './imageGenerator';

export interface SharedTemplate {
  id: string;
  name: string;
  author_name: string | null;
  text_config: TextConfig;
  text_enabled: boolean;
  overlay_metadata: SavedOverlay[] | null;
  baseplate_url: string | null;
  overlay_urls: string[] | null;
  downloads_count: number;
  created_at: string;
}

export interface SharedTemplateInsert {
  name: string;
  author_name?: string | null;
  text_config: TextConfig;
  text_enabled: boolean;
  overlay_metadata?: SavedOverlay[] | null;
  baseplate_url?: string | null;
  overlay_urls?: string[] | null;
}
