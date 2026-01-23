import { useCallback } from 'react';
import { EventData, TemplateConfig, GeneratedImage, TextFieldConfig, DEFAULT_TEXT_FIELDS } from '@/types/imageGenerator';
import { format } from 'date-fns';

export const useImageGenerator = () => {
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      // Use a CORS proxy for external images
      if (src.startsWith('http') && !src.includes('localhost')) {
        img.src = `https://corsproxy.io/?${encodeURIComponent(src)}`;
      } else {
        img.src = src;
      }
    });
  }, []);

  const formatDate = useCallback((dateStr: string, dateFormat: TextFieldConfig['dateFormat']): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      switch (dateFormat) {
        case 'short':
          return format(date, 'MMM d');
        case 'full':
          return format(date, 'EEEE, MMMM d, yyyy');
        case 'long':
        default:
          return format(date, 'MMMM d, yyyy');
      }
    } catch {
      return dateStr;
    }
  }, []);

  const formatLocation = useCallback((event: EventData, locationFormat: TextFieldConfig['locationFormat']): string => {
    switch (locationFormat) {
      case 'city':
        return event.CITY_NAME;
      case 'city-country':
        return `${event.CITY_NAME}, ${event.COUNTRY_NAME}`;
      case 'city-state':
      default:
        return event.STATE_CODE 
          ? `${event.CITY_NAME}, ${event.STATE_CODE}`
          : `${event.CITY_NAME}, ${event.COUNTRY_NAME}`;
    }
  }, []);

  const buildTextLines = useCallback((event: EventData, fields: TextFieldConfig): string[] => {
    const lines: string[] = [];
    
    if (fields.showEventName) {
      lines.push(event.EVENT_NAME);
    }
    if (fields.showDate && event.STARTS_AT) {
      lines.push(formatDate(event.STARTS_AT, fields.dateFormat));
    }
    if (fields.showVenue && event.VENUE_NAME) {
      lines.push(event.VENUE_NAME);
    }
    if (fields.showLocation && event.CITY_NAME) {
      lines.push(formatLocation(event, fields.locationFormat));
    }
    
    return lines;
  }, [formatDate, formatLocation]);

  const generateImage = useCallback(async (
    event: EventData,
    template: TemplateConfig,
    customImageUrl?: string
  ): Promise<GeneratedImage | null> => {
    if (!template.baseplate) {
      console.error('Template not configured properly');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Set canvas size to match baseplate
      const canvasWidth = template.baseplate.width;
      const canvasHeight = template.baseplate.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Draw baseplate first (background)
      ctx.drawImage(template.baseplate, 0, 0);
      
      // Load event image (use custom URL if provided)
      const imageUrl = customImageUrl || event.EVENT_IMAGE_LARGE_URL;
      const eventImage = await loadImage(imageUrl);
      
      // Calculate event image size (wider, ~800px)
      const targetWidth = Math.min(canvasWidth * 0.8, 800);
      const eventAspect = eventImage.width / eventImage.height;
      
      const drawWidth = targetWidth;
      const drawHeight = drawWidth / eventAspect;
      
      // Center the event image
      const drawX = (canvasWidth - drawWidth) / 2;
      const drawY = (canvasHeight - drawHeight) / 2;
      
      // Draw overlays BELOW event image
      const belowOverlays = template.overlays.filter(o => o.layer === 'below');
      for (const overlay of belowOverlays) {
        ctx.drawImage(overlay.image, overlay.x, overlay.y, overlay.width, overlay.height);
      }
      
      // Draw event image (middle layer)
      ctx.drawImage(eventImage, drawX, drawY, drawWidth, drawHeight);
      
      // Draw overlays ABOVE event image
      const aboveOverlays = template.overlays.filter(o => o.layer === 'above');
      for (const overlay of aboveOverlays) {
        ctx.drawImage(overlay.image, overlay.x, overlay.y, overlay.width, overlay.height);
      }
      
      // Draw text (if enabled)
      const { textConfig } = template;
      if (template.textEnabled !== false) {
        const fields = textConfig.fields || DEFAULT_TEXT_FIELDS;
        const textLines = buildTextLines(event, fields);
        
        ctx.font = `bold ${textConfig.fontSize}px ${textConfig.fontFamily}`;
        ctx.fillStyle = textConfig.color;
        ctx.textAlign = textConfig.textAlign;
        ctx.textBaseline = 'top';
        
        const lineHeight = textConfig.fontSize * 1.2;
        let currentY = textConfig.y;
        
        // Draw each text line with word wrapping
        for (const lineText of textLines) {
          const words = lineText.split(' ');
          let line = '';
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > textConfig.maxWidth && i > 0) {
              ctx.fillText(line.trim(), textConfig.x, currentY);
              line = words[i] + ' ';
              currentY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line.trim(), textConfig.x, currentY);
          currentY += lineHeight;
        }
      }
      
      return {
        eventId: event.EVENT_ID,
        eventName: event.EVENT_NAME,
        templateId: '',
        templateName: '',
        dataUrl: canvas.toDataURL('image/png'),
      };
    } catch (error) {
      console.error('Failed to generate image for event:', event.EVENT_NAME, error);
      return null;
    }
  }, [loadImage, buildTextLines]);

  return { generateImage, loadImage };
};
