/**
 * Compresses an image file to reduce storage size while maintaining quality.
 * Uses canvas to re-encode the image with configurable quality settings.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, for JPEG/WebP
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  format: 'image/webp', // WebP offers best compression
};

/**
 * Compresses an image from a data URL
 */
export const compressImage = (
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxW = opts.maxWidth!;
        const maxH = opts.maxHeight!;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // For PNG overlays with transparency, we need to use PNG format
        // Otherwise use WebP for better compression
        const hasTransparency = detectTransparency(ctx, width, height);
        const format = hasTransparency ? 'image/png' : opts.format!;
        const quality = hasTransparency ? undefined : opts.quality;

        const compressedDataUrl = canvas.toDataURL(format, quality);
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

/**
 * Compresses an image from a File object
 */
export const compressImageFile = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        const compressed = await compressImage(dataUrl, options);
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Detects if an image has transparent pixels
 */
const detectTransparency = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean => {
  // Sample a grid of pixels to check for transparency
  const sampleSize = 10;
  const stepX = Math.max(1, Math.floor(width / sampleSize));
  const stepY = Math.max(1, Math.floor(height / sampleSize));

  for (let x = 0; x < width; x += stepX) {
    for (let y = 0; y < height; y += stepY) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      if (pixel[3] < 255) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Estimates the size of a data URL in bytes
 */
export const estimateDataUrlSize = (dataUrl: string): number => {
  // Remove the data URL header to get just the base64 content
  const base64 = dataUrl.split(',')[1] || '';
  // Base64 uses 4 characters to represent 3 bytes
  return Math.ceil((base64.length * 3) / 4);
};

/**
 * Formats bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
