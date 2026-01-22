import { useCallback } from 'react';
import { EventData, TemplateConfig, GeneratedImage } from '@/types/imageGenerator';

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

  const generateImage = useCallback(async (
    event: EventData,
    template: TemplateConfig
  ): Promise<GeneratedImage | null> => {
    if (!template.baseplate || !template.transparentRegion) {
      console.error('Template not configured properly');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Set canvas size to match baseplate
      canvas.width = template.baseplate.width;
      canvas.height = template.baseplate.height;
      
      // Load event image
      const eventImage = await loadImage(event.EVENT_IMAGE_LARGE_URL);
      
      // Calculate how to fit event image into transparent region
      const region = template.transparentRegion;
      const eventAspect = eventImage.width / eventImage.height;
      const regionAspect = region.width / region.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      // Cover the region (crop if needed)
      if (eventAspect > regionAspect) {
        // Event image is wider - fit by height
        drawHeight = region.height;
        drawWidth = drawHeight * eventAspect;
        drawX = region.x - (drawWidth - region.width) / 2;
        drawY = region.y;
      } else {
        // Event image is taller - fit by width
        drawWidth = region.width;
        drawHeight = drawWidth / eventAspect;
        drawX = region.x;
        drawY = region.y - (drawHeight - region.height) / 2;
      }
      
      // Draw event image (behind baseplate)
      ctx.save();
      ctx.beginPath();
      ctx.rect(region.x, region.y, region.width, region.height);
      ctx.clip();
      ctx.drawImage(eventImage, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
      
      // Draw baseplate on top
      ctx.drawImage(template.baseplate, 0, 0);
      
      // Draw overlays
      for (const overlay of template.overlays) {
        ctx.drawImage(overlay.image, overlay.x, overlay.y, overlay.width, overlay.height);
      }
      
      // Draw text
      const { textConfig } = template;
      ctx.font = `${textConfig.fontSize}px ${textConfig.fontFamily}`;
      ctx.fillStyle = textConfig.color;
      ctx.textAlign = textConfig.textAlign;
      ctx.textBaseline = 'top';
      
      // Word wrap text if needed
      const words = event.EVENT_NAME.split(' ');
      let line = '';
      let y = textConfig.y;
      const lineHeight = textConfig.fontSize * 1.2;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > textConfig.maxWidth && i > 0) {
          ctx.fillText(line.trim(), textConfig.x, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), textConfig.x, y);
      
      return {
        eventId: event.EVENT_ID,
        eventName: event.EVENT_NAME,
        dataUrl: canvas.toDataURL('image/png'),
      };
    } catch (error) {
      console.error('Failed to generate image for event:', event.EVENT_NAME, error);
      return null;
    }
  }, [loadImage]);

  return { generateImage, loadImage };
};
