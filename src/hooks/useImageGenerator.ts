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
      
      // Load event image
      const eventImage = await loadImage(event.EVENT_IMAGE_LARGE_URL);
      
      // Calculate how to center event image to cover the full canvas
      const eventAspect = eventImage.width / eventImage.height;
      const canvasAspect = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      // Cover the canvas (crop if needed to fill the entire area)
      if (eventAspect > canvasAspect) {
        // Event image is wider - fit by height, crop width
        drawHeight = canvasHeight;
        drawWidth = drawHeight * eventAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        // Event image is taller - fit by width, crop height
        drawWidth = canvasWidth;
        drawHeight = drawWidth / eventAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }
      
      // Draw event image (centered, covering full canvas)
      ctx.drawImage(eventImage, drawX, drawY, drawWidth, drawHeight);
      
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
        templateId: '',
        templateName: '',
        dataUrl: canvas.toDataURL('image/png'),
      };
    } catch (error) {
      console.error('Failed to generate image for event:', event.EVENT_NAME, error);
      return null;
    }
  }, [loadImage]);

  return { generateImage, loadImage };
};
