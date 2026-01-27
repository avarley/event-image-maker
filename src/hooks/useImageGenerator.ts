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

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatDate = useCallback((dateStr: string, fields: TextFieldConfig): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const day = date.getDate();
      const ordinalSuffix = fields.dateOrdinal ? getOrdinalSuffix(day) : '';
      
      switch (fields.dateFormat) {
        case 'short': {
          let month = format(date, 'MMM'); // e.g., "Feb"
          if (fields.dateUppercase) month = month.toUpperCase();
          return `${day}${ordinalSuffix} ${month}`;
        }
        case 'full': {
          const dayName = format(date, 'EEEE');
          let month = format(date, 'MMMM');
          const year = format(date, 'yyyy');
          if (fields.dateUppercase) month = month.toUpperCase();
          return `${dayName}, ${day}${ordinalSuffix} ${month} ${year}`;
        }
        case 'long':
        default: {
          let month = format(date, 'MMMM');
          const year = format(date, 'yyyy');
          if (fields.dateUppercase) month = month.toUpperCase();
          return `${day}${ordinalSuffix} ${month} ${year}`;
        }
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
      lines.push(formatDate(event.STARTS_AT, fields));
    }
    
    // Concatenate venue and location on the same line
    const venuePart = fields.showVenue && event.VENUE_NAME ? event.VENUE_NAME : '';
    const locationPart = fields.showLocation && event.CITY_NAME ? formatLocation(event, fields.locationFormat) : '';
    
    if (venuePart && locationPart) {
      lines.push(`${venuePart}, ${locationPart}`);
    } else if (venuePart) {
      lines.push(venuePart);
    } else if (locationPart) {
      lines.push(locationPart);
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
      
      // Draw bottom shadow gradient (if enabled) - first layer above baseplate
      if (template.textConfig.bottomShadowEnabled) {
        const gradientHeight = canvasHeight / 3;
        const gradient = ctx.createLinearGradient(
          0, canvasHeight - gradientHeight,
          0, canvasHeight
        );
        const opacity = template.textConfig.bottomShadowOpacity ?? 0.5;
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvasHeight - gradientHeight, canvasWidth, gradientHeight);
      }
      
      // Load event image (use custom URL if provided)
      const imageUrl = customImageUrl || event.EVENT_IMAGE_LARGE_URL;
      const eventImage = await loadImage(imageUrl);
      
      // Calculate 4:5 safe zone width (visible area when cropped to portrait)
      const portrait45Width = canvasHeight * (4 / 5);
      const safeZoneWidth = Math.min(canvasWidth, portrait45Width);
      
      // Event image spans 95% of the safe zone width
      const targetWidth = safeZoneWidth * 0.95;
      const eventAspect = eventImage.width / eventImage.height;
      
      const drawWidth = targetWidth;
      const drawHeight = drawWidth / eventAspect;
      
      // Center the event image horizontally, move up 100px from center
      const drawX = (canvasWidth - drawWidth) / 2;
      const drawY = (canvasHeight - drawHeight) / 2 - 100;
      
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
        
        ctx.fillStyle = textConfig.color;
        ctx.textAlign = textConfig.textAlign;
        ctx.textBaseline = 'top';
        
        let currentY = textConfig.y;
        let isFirstLine = true;
        
        // Draw each text line with word wrapping
        for (const lineText of textLines) {
          // Use event name font size for first line if it's the event name
          const currentFontSize = (isFirstLine && fields.showEventName && textConfig.eventNameFontSize)
            ? textConfig.eventNameFontSize
            : textConfig.fontSize;
          
          ctx.font = `bold ${currentFontSize}px ${textConfig.fontFamily}`;
          const lineHeight = currentFontSize * 1.2;
          
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
          isFirstLine = false;
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
