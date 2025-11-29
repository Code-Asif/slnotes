import express from 'express';
import mongoose from 'mongoose';
import Material from '../models/Material.js';
import { downloadFromGridFS, fileExists } from '../utils/gridfs.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Get all materials with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      classLevel,
      category,
      subject,
      priceMin,
      priceMax,
      isFree,
      isFeatured,
      tags
    } = req.query;

    const query = {};

    // Search - use regex search (works without text index)
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filters
    if (classLevel) query.classLevel = classLevel;
    if (category) query.category = category;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (isFree !== undefined) {
      query.priceINR = isFree === 'true' ? 0 : { $gt: 0 };
    }
    if (priceMin || priceMax) {
      query.priceINR = {};
      if (priceMin) query.priceINR.$gte = Number(priceMin);
      if (priceMax) query.priceINR.$lte = Number(priceMax);
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [materials, total] = await Promise.all([
      Material.find(query)
        .select('-pdfFileId') // Don't expose PDF file ID, but keep previewImageId for display
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Material.countDocuments(query)
    ]);

    res.json({
      success: true,
      materials,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching materials:', error);
    res.status(500).json({ success: false, message: 'Error fetching materials' });
  }
});

// Get featured materials
router.get('/featured', async (req, res) => {
  try {
    const materials = await Material.find({ isFeatured: true })
      .select('-pdfFileId') // Keep previewImageId for display
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, materials });
  } catch (error) {
    logger.error('Error fetching featured materials:', error);
    res.status(500).json({ success: false, message: 'Error fetching featured materials' });
  }
});

// Get single material by ID
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .select('-pdfFileId') // Don't expose PDF file ID, but keep previewImageId for display
      .lean();

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Log preview image ID for debugging
    if (material.previewImageId) {
      logger.info(`Material ${req.params.id} has previewImageId: ${material.previewImageId}`);
    } else {
      logger.warn(`Material ${req.params.id} does not have previewImageId`);
    }

    res.json({ success: true, material });
  } catch (error) {
    logger.error('Error fetching material:', error);
    res.status(500).json({ success: false, message: 'Error fetching material' });
  }
});

// Get preview image
router.get('/:id/preview', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).select('previewImageId');

    if (!material) {
      logger.warn(`Preview requested for non-existent material: ${req.params.id}`);
      // Return a 1x1 transparent PNG as placeholder
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(transparentPng);
    }

    if (!material.previewImageId) {
      logger.warn(`Material ${req.params.id} does not have previewImageId`);
      // Return a 1x1 transparent PNG as placeholder
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(transparentPng);
    }

    // Convert to ObjectId if it's a string
    let fileId = material.previewImageId;
    if (typeof fileId === 'string') {
      try {
        fileId = new mongoose.Types.ObjectId(fileId);
      } catch (e) {
        logger.error(`Invalid ObjectId format for preview: ${fileId}`);
        const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache');
        return res.send(transparentPng);
      }
    }

    logger.info(`Streaming preview for material ${req.params.id}, previewImageId: ${fileId}`);
    
    // Check if file exists first
    const exists = await fileExists(fileId);
    if (!exists) {
      logger.warn(`Preview file ${fileId} does not exist in GridFS`);
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(transparentPng);
    }

    const downloadStream = downloadFromGridFS(fileId);
    
    downloadStream.on('error', (error) => {
      logger.error(`Error streaming preview for material ${req.params.id}:`, error);
      if (!res.headersSent) {
        // Return transparent PNG on error
        const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(transparentPng);
      }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    downloadStream.pipe(res);
  } catch (error) {
    logger.error('Error fetching preview:', error);
    // Return transparent PNG on error
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(transparentPng);
  }
});

// Get related materials
router.get('/:id/related', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).select('category classLevel subject tags');

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const query = { _id: { $ne: material._id } };
    
    // Find materials with same category or class level
    if (material.category) {
      query.category = material.category;
    }
    if (material.classLevel) {
      query.classLevel = material.classLevel;
    }

    const relatedMaterials = await Material.find(query)
      .select('-pdfFileId') // Keep previewImageId for display
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(4)
      .lean();

    res.json({ success: true, materials: relatedMaterials });
  } catch (error) {
    logger.error('Error fetching related materials:', error);
    res.status(500).json({ success: false, message: 'Error fetching related materials' });
  }
});

export default router;

