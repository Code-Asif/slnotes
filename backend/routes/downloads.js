import express from 'express';
import Order from '../models/Order.js';
import Material from '../models/Material.js';
import { downloadFromGridFS, getFileMetadata } from '../utils/gridfs.js';
import { downloadLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Free download
router.get('/free/:materialId', downloadLimiter, async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.priceINR > 0) {
      return res.status(403).json({ success: false, message: 'This is a paid material' });
    }

    if (!material.pdfFileId) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Get file metadata for original filename and content type
    const fileMetadata = await getFileMetadata(material.pdfFileId);

    const downloadStream = downloadFromGridFS(material.pdfFileId);

    downloadStream.on('error', (error) => {
      logger.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'File not found' });
      }
    });

    // Set headers - support any file type
    const filename = material.fileNameOriginal || fileMetadata?.metadata?.originalName || 'material';
    const contentType = fileMetadata?.metadata?.mimeType || fileMetadata?.contentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    downloadStream.pipe(res);
  } catch (error) {
    logger.error('Error downloading free material:', error);
    res.status(500).json({ success: false, message: 'Error downloading material' });
  }
});

// Paid download (protected)
router.get('/paid/:orderId', downloadLimiter, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('material');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'captured') {
      return res.status(403).json({ 
        success: false, 
        message: 'This order has been refunded or failed' 
      });
    }

    if (!order.material || !order.material.pdfFileId) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Get file metadata for original filename and content type
    const fileMetadata = await getFileMetadata(order.material.pdfFileId);

    const downloadStream = downloadFromGridFS(order.material.pdfFileId);

    downloadStream.on('error', (error) => {
      logger.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'File not found' });
      }
    });

    // Set headers - support any file type
    const filename = order.material.fileNameOriginal || fileMetadata?.metadata?.originalName || 'material';
    const contentType = fileMetadata?.metadata?.mimeType || fileMetadata?.contentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    downloadStream.pipe(res);
  } catch (error) {
    logger.error('Error downloading paid material:', error);
    res.status(500).json({ success: false, message: 'Error downloading material' });
  }
});

export default router;

