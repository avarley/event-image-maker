import { useCallback } from 'react';
import { EventData, TemplateConfig, GeneratedImage, TextFieldConfig, DEFAULT_TEXT_FIELDS, FontWeight } from '@/types/imageGenerator';
import { format } from 'date-fns';

export const useImageGenerator = () => {
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error('Image load failed for:', src, e);
        reject(e);
      };
      
      // For data URLs or local files, load directly
      if (src.startsWith('data:') || src.startsWith('blob:') || !src.startsWith('http')) {
        img.src = src;
        return;
      }
      
      // For external URLs, try direct load first, then fallback to proxy
      const tryDirectLoad = () => {
        img.src = src;
      };
      
      const tryProxyLoad = () => {
        // Use corsproxy.io as primary proxy (more reliable)
        img.src = `https://corsproxy.io/?${encodeURIComponent(src)}`;
      };
      
      // Try direct load first
      const directImg = new Image();
      directImg.crossOrigin = 'anonymous';
      directImg.onload = () => {
        img.src = src;
      };
      directImg.onerror = () => {
        // Direct load failed, try proxy
        tryProxyLoad();
      };
      directImg.src = src;
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

  interface TextLine {
    text: string;
    fontWeight: FontWeight;
    fontFamily: string;
    letterSpacing: number;
    isEventName: boolean;
  }

  const buildTextLines = useCallback((event: EventData, fields: TextFieldConfig, defaultFontFamily: string): TextLine[] => {
    const lines: TextLine[] = [];
    
    if (fields.showEventName) {
      const eventName = fields.eventNameUppercase 
        ? event.EVENT_NAME.toUpperCase() 
        : event.EVENT_NAME;
      lines.push({
        text: eventName,
        fontWeight: fields.eventNameFontWeight || '700',
        fontFamily: fields.eventNameFontFamily || defaultFontFamily,
        letterSpacing: fields.eventNameLetterSpacing ?? 0,
        isEventName: true,
      });
    }
    if (fields.showDate && event.STARTS_AT) {
      let dateText = formatDate(event.STARTS_AT, fields);
      if (fields.dateFullUppercase) {
        dateText = dateText.toUpperCase();
      }
      lines.push({
        text: dateText,
        fontWeight: fields.dateFontWeight || '700',
        fontFamily: fields.dateFontFamily || defaultFontFamily,
        letterSpacing: fields.dateLetterSpacing ?? 0,
        isEventName: false,
      });
    }
    
    // Concatenate venue and location on the same line
    const venuePart = fields.showVenue && event.VENUE_NAME ? event.VENUE_NAME : '';
    const locationPart = fields.showLocation && event.CITY_NAME ? formatLocation(event, fields.locationFormat) : '';
    
    let venueLocationText = '';
    if (venuePart && locationPart) {
      venueLocationText = `${venuePart}, ${locationPart}`;
    } else if (venuePart) {
      venueLocationText = venuePart;
    } else if (locationPart) {
      venueLocationText = locationPart;
    }
    
    if (venueLocationText) {
      if (fields.venueLocationUppercase) {
        venueLocationText = venueLocationText.toUpperCase();
      }
      lines.push({
        text: venueLocationText,
        fontWeight: fields.venueLocationFontWeight || '700',
        fontFamily: fields.venueLocationFontFamily || defaultFontFamily,
        letterSpacing: fields.venueLocationLetterSpacing ?? 0,
        isEventName: false,
      });
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
      
      // Helper function to draw overlay with rotation and flip
      const drawOverlayWithTransform = (overlay: typeof template.overlays[0]) => {
        const rotation = overlay.rotation || 0;
        const flipH = overlay.flipHorizontal || false;
        const flipV = overlay.flipVertical || false;
        
        // Calculate center of the overlay
        const centerX = overlay.x + overlay.width / 2;
        const centerY = overlay.y + overlay.height / 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Apply rotation
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }
        
        // Apply flip transforms
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        
        ctx.drawImage(
          overlay.image,
          -overlay.width / 2,
          -overlay.height / 2,
          overlay.width,
          overlay.height
        );
        ctx.restore();
      };
      
      // Load event image (use custom URL if provided)
      const imageUrl = customImageUrl || event.EVENT_IMAGE_LARGE_URL;
      const eventImage = await loadImage(imageUrl);
      
      // Get frame settings from config
      const frameWidthPercent = template.textConfig.eventImageWidth ?? 80;
      const frameHeightPercent = template.textConfig.eventImageHeight ?? 50;
      const xPercent = template.textConfig.eventImageX ?? 50;
      const yPercent = template.textConfig.eventImageY ?? 30;
      const borderRadius = template.textConfig.eventImageBorderRadius ?? 0;
      
      // Calculate frame dimensions
      const frameWidth = canvasWidth * (frameWidthPercent / 100);
      const frameHeight = canvasHeight * (frameHeightPercent / 100);
      
      // Calculate frame position (percentage-based, 50 = centered)
      const frameX = (canvasWidth - frameWidth) * (xPercent / 100);
      const frameY = (canvasHeight - frameHeight) * (yPercent / 100);
      
      // Calculate how to fit event image within frame (cover mode within frame)
      const eventAspect = eventImage.width / eventImage.height;
      const frameAspect = frameWidth / frameHeight;
      
      let srcX = 0, srcY = 0, srcWidth = eventImage.width, srcHeight = eventImage.height;
      
      if (eventAspect > frameAspect) {
        // Image is wider - crop sides
        srcWidth = eventImage.height * frameAspect;
        srcX = (eventImage.width - srcWidth) / 2;
      } else {
        // Image is taller - crop top/bottom
        srcHeight = eventImage.width / frameAspect;
        srcY = (eventImage.height - srcHeight) / 2;
      }
      
      // Draw event image within frame with optional rounded corners
      ctx.save();
      if (borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameWidth, frameHeight, borderRadius);
        ctx.clip();
      }
      ctx.drawImage(
        eventImage,
        srcX, srcY, srcWidth, srcHeight,
        frameX, frameY, frameWidth, frameHeight
      );
      ctx.restore();
      
      // Draw bottom shadow gradient (if enabled) - AFTER event image, BEFORE above overlays
      if (template.textConfig.bottomShadowEnabled) {
        const heightPercent = (template.textConfig.bottomShadowHeight ?? 33) / 100;
        const gradientHeight = canvasHeight * heightPercent;
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
      
      // Draw ALL overlays above event image and shadow
      for (const overlay of template.overlays) {
        drawOverlayWithTransform(overlay);
      }
      
      // Draw text (if enabled)
      const { textConfig } = template;
      if (template.textEnabled !== false) {
        const fields = textConfig.fields || DEFAULT_TEXT_FIELDS;
        const textLines = buildTextLines(event, fields, textConfig.fontFamily);
        
        ctx.fillStyle = textConfig.color;
        ctx.textAlign = textConfig.textAlign;
        ctx.textBaseline = 'top';
        
        let currentY = textConfig.y;
        
        // Draw each text line with word wrapping
        for (const lineData of textLines) {
          // Use event name font size for event name line
          const currentFontSize = (lineData.isEventName && textConfig.eventNameFontSize)
            ? textConfig.eventNameFontSize
            : textConfig.fontSize;
          
          ctx.font = `${lineData.fontWeight} ${currentFontSize}px ${lineData.fontFamily}`;
          ctx.letterSpacing = `${lineData.letterSpacing}px`;
          const lineHeightMultiplier = textConfig.lineHeight ?? 1.2;
          const lineHeight = currentFontSize * lineHeightMultiplier;
          
          const words = lineData.text.split(' ');
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
