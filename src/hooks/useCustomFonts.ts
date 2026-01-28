import { useEffect, useCallback } from 'react';
import { CustomFont } from '@/types/imageGenerator';

// Track which fonts have been registered globally
const registeredFonts = new Set<string>();

/**
 * Hook to manage custom font loading and registration
 */
export const useCustomFonts = (customFonts: CustomFont[] = []) => {
  // Register fonts when they change
  useEffect(() => {
    const loadFonts = async () => {
      for (const font of customFonts) {
        if (registeredFonts.has(font.id)) continue;
        
        try {
          const fontFace = new FontFace(font.name, `url(${font.dataUrl})`, {
            style: 'normal',
            weight: '400',
          });
          
          await fontFace.load();
          document.fonts.add(fontFace);
          registeredFonts.add(font.id);
          console.log(`Loaded custom font: ${font.name}`);
        } catch (error) {
          console.error(`Failed to load font ${font.name}:`, error);
        }
      }
    };
    
    loadFonts();
  }, [customFonts]);

  return { registeredFonts };
};

/**
 * Get the font format from file extension
 */
export const getFontFormat = (filename: string): CustomFont['format'] | null => {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'ttf':
      return 'truetype';
    case 'otf':
      return 'opentype';
    case 'woff':
      return 'woff';
    case 'woff2':
      return 'woff2';
    default:
      return null;
  }
};

/**
 * Load a font file and convert to base64 data URL
 */
export const loadFontFile = (file: File): Promise<{ dataUrl: string; name: string; format: CustomFont['format'] }> => {
  return new Promise((resolve, reject) => {
    const format = getFontFormat(file.name);
    if (!format) {
      reject(new Error('Unsupported font format. Please use TTF, OTF, WOFF, or WOFF2.'));
      return;
    }
    
    // Extract font name from filename (remove extension)
    const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve({ dataUrl, name, format });
    };
    reader.onerror = () => reject(new Error('Failed to read font file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Preload a font for canvas rendering (ensures font is available before drawing)
 */
export const preloadFontForCanvas = async (fontName: string, dataUrl: string): Promise<void> => {
  // Check if already loaded
  if (document.fonts.check(`16px "${fontName}"`)) {
    return;
  }
  
  try {
    const fontFace = new FontFace(fontName, `url(${dataUrl})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch (error) {
    console.error(`Failed to preload font ${fontName}:`, error);
  }
};
