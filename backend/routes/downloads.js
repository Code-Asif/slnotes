import express from 'express';
import Order from '../models/Order.js';
import Material from '../models/Material.js';
import { downloadFromGridFS, getFileMetadata } from '../utils/gridfs.js';
import { downloadLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Free download with enhanced error handling
router.get('/free/:materialId', downloadLimiter, async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);

    if (!material) {
      logger.warn(`Free download requested for non-existent material: ${materialId}`);
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.priceINR > 0) {
      logger.warn(`Free download requested for paid material: ${materialId}`);
      return res.status(403).json({ success: false, message: 'This is a paid material' });
    }

    if (!material.pdfFileId) {
      logger.warn(`Free download - file ID missing for material: ${materialId}`);
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Get file metadata for original filename and content type
    let fileMetadata;
    try {
      fileMetadata = await getFileMetadata(material.pdfFileId);
      if (!fileMetadata) {
        logger.warn(`File metadata not found for: ${material.pdfFileId}`);
      }
    } catch (metadataError) {
      logger.error('Error getting file metadata:', metadataError);
      // Continue without metadata
    }

    const downloadStream = downloadFromGridFS(material.pdfFileId);
    let headersSent = false;

    downloadStream.on('error', (error) => {
      logger.error(`Error streaming file for material ${materialId}:`, error);
      if (!res.headersSent && !headersSent) {
        headersSent = true;
        res.status(500).json({ success: false, message: 'Error downloading file' });
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    downloadStream.on('end', () => {
      logger.info(`Successfully streamed file for material: ${materialId}`);
    });

    // Set headers - support any file type
    const filename = material.fileNameOriginal || fileMetadata?.metadata?.originalName || 'material';
    const contentType = fileMetadata?.metadata?.mimeType || fileMetadata?.contentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    headersSent = true;

    downloadStream.pipe(res);
  } catch (error) {
    logger.error('Error downloading free material:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error downloading material' });
    }
  }
});

// Paid download (protected) with enhanced error handling
router.get('/paid/:orderId', downloadLimiter, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('material');

    if (!order) {
      logger.warn(`Paid download requested for non-existent order: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'captured') {
      logger.warn(`Paid download requested for non-captured order: ${orderId}, status: ${order.status}`);
      return res.status(403).json({ 
        success: false, 
        message: 'This order has been refunded or failed' 
      });
    }

    if (!order.material) {
      logger.warn(`Paid download - material not found for order: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (!order.material.pdfFileId) {
      logger.warn(`Paid download - file ID missing for material in order: ${orderId}`);
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Get file metadata for original filename and content type
    let fileMetadata;
    try {
      fileMetadata = await getFileMetadata(order.material.pdfFileId);
      if (!fileMetadata) {
        logger.warn(`File metadata not found for: ${order.material.pdfFileId}`);
      }
    } catch (metadataError) {
      logger.error('Error getting file metadata:', metadataError);
      // Continue without metadata
    }

    const downloadStream = downloadFromGridFS(order.material.pdfFileId);
    let headersSent = false;

    downloadStream.on('error', (error) => {
      logger.error(`Error streaming file for order ${orderId}:`, error);
      if (!res.headersSent && !headersSent) {
        headersSent = true;
        res.status(500).json({ success: false, message: 'Error downloading file' });
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    downloadStream.on('end', () => {
      logger.info(`Successfully streamed file for order: ${orderId}`);
    });

    // Set headers - support any file type
    const filename = order.material.fileNameOriginal || fileMetadata?.metadata?.originalName || 'material';
    const contentType = fileMetadata?.metadata?.mimeType || fileMetadata?.contentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    headersSent = true;

    downloadStream.pipe(res);
  } catch (error) {
    logger.error('Error downloading paid material:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error downloading material' });
    }
  }
});

export default router;

