import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import { uploadToGridFS } from './gridfs.js';
import { logger } from '../config/logger.js';

// Resize image to consistent size for preview (800x600, maintaining aspect ratio)
export const resizePreviewImage = async (imageBuffer, mimeType = 'image/png') => {
  try {
    // Try to import sharp or canvas for image processing
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (sharpError) {
      // Try canvas as fallback
      try {
        const canvasModule = await import('canvas');
        const { loadImage, createCanvas } = canvasModule;
        
        const img = await loadImage(imageBuffer);
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let width = 800;
        let height = 600;
        
        if (aspectRatio > 800 / 600) {
          height = 800 / aspectRatio;
        } else {
          width = 600 * aspectRatio;
        }
        
        // Center the image
        const x = (800 - width) / 2;
        const y = (600 - height) / 2;
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw resized image
        ctx.drawImage(img, x, y, width, height);
        
        return canvas.toBuffer('image/png');
      } catch (canvasError) {
        logger.warn('Neither sharp nor canvas available for image resizing. Using original image.');
        return imageBuffer;
      }
    }
    
    // Use sharp for resizing (preferred method)
    if (sharp) {
      return await sharp(imageBuffer)
        .resize(800, 600, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toBuffer();
    }
    
    return imageBuffer;
  } catch (error) {
    logger.error('Error resizing preview image:', error);
    return imageBuffer; // Return original if resize fails
  }
};

// Set worker source for pdfjs (only if GlobalWorkerOptions exists)
// Note: In Node.js, GlobalWorkerOptions might not be available or needed
if (typeof window === 'undefined') {
  if (pdfjsLib.GlobalWorkerOptions) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    } catch (error) {
      // Worker options might not be needed in Node.js environment - silently continue
    }
  }
  // If GlobalWorkerOptions doesn't exist, that's fine - pdfjs-dist works without it in Node.js
}

// Extract first page as preview image
export const extractFirstPageAsImage = async (pdfBuffer) => {
  try {
    // Try to import canvas - if not available, skip preview generation
    let createCanvas;
    try {
      const canvasModule = await import('canvas');
      createCanvas = canvasModule.createCanvas;
    } catch (canvasError) {
      logger.warn('Canvas module not available, skipping preview generation. Install canvas package for preview support.');
      return null;
    }

    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    // Use node-canvas for server-side rendering
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert canvas to buffer
    const imageBuffer = canvas.toBuffer('image/png');
    
    // Upload to GridFS
    const imageId = await uploadToGridFS(imageBuffer, `preview-${uuidv4()}.png`, {
      type: 'preview'
    });

    return imageId;
  } catch (error) {
    logger.error('Error extracting first page:', error);
    return null;
  }
};

// Validate PDF file
export const validatePDF = (buffer) => {
  // Check magic bytes for PDF
  const pdfMagicBytes = buffer.slice(0, 4).toString('ascii');
  if (pdfMagicBytes !== '%PDF') {
    return { valid: false, error: 'Invalid PDF file format' };
  }

  // Check file size (max 100 MB)
  const maxSize = 100 * 1024 * 1024; // 100 MB
  if (buffer.length > maxSize) {
    return { valid: false, error: 'File size exceeds 100 MB limit' };
  }

  return { valid: true };
};

