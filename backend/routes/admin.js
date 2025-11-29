import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import Material from '../models/Material.js';
import Order from '../models/Order.js';
import Admin from '../models/Admin.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadToGridFS, deleteFromGridFS } from '../utils/gridfs.js';
import { extractFirstPageAsImage, validatePDF, resizePreviewImage } from '../utils/pdfProcessor.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Multer setup for file uploads - no size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Infinity } // No size limit
});

// Initialize Razorpay lazily
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// Admin login - plain text password comparison
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const admin = await Admin.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Plain text password comparison (no encryption)
    if (admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Get admin dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate date ranges for last 7 days and last 30 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      totalMaterials,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      topMaterials,
      recentOrders,
      revenueLast7Days,
      revenueLast30Days,
      ordersLast7Days
    ] = await Promise.all([
      Material.countDocuments(),
      Order.countDocuments({ status: 'captured' }),
      Order.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, total: { $sum: '$amountPaidINR' } } }
      ]),
      Order.countDocuments({ status: 'captured', createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amountPaidINR' } } }
      ]),
      Material.find()
        .select('title downloadCount priceINR')
        .sort({ downloadCount: -1 })
        .limit(5)
        .lean(),
      Order.find({ status: 'captured' })
        .populate('material', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      // Revenue trend for last 7 days
      Order.aggregate([
        {
          $match: {
            status: 'captured',
            createdAt: { $gte: last7Days }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amountPaidINR' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Revenue trend for last 30 days
      Order.aggregate([
        {
          $match: {
            status: 'captured',
            createdAt: { $gte: last30Days }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amountPaidINR' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Orders count for last 7 days
      Order.aggregate([
        {
          $match: {
            status: 'captured',
            createdAt: { $gte: last7Days }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalMaterials,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        topMaterials,
        recentOrders,
        revenueTrend7Days: revenueLast7Days,
        revenueTrend30Days: revenueLast30Days,
        ordersTrend7Days: ordersLast7Days
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});

// Create material
router.post('/materials', authenticateAdmin, upload.fields([
  { name: 'file', maxCount: 1 }, // Changed from 'pdf' to 'file' to accept any file type
  { name: 'previewImage', maxCount: 1 }, // Added preview image upload
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      classLevel,
      category,
      priceINR,
      tags,
      isFeatured,
      fileNameOriginal
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const file = req.files?.file?.[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    // Upload file to GridFS (accept any file type)
    const fileId = await uploadToGridFS(
      file.buffer,
      file.originalname,
      { type: 'document', mimeType: file.mimetype }
    );

    // Handle preview image - prioritize uploaded preview image, then try to extract from PDF
    let previewImageId = null;
    
    // First, check if admin uploaded a preview image
    if (req.files?.previewImage?.[0]) {
      try {
        const previewFile = req.files.previewImage[0];
        logger.info('Processing uploaded preview image:', previewFile.originalname);
        // Resize preview image to consistent size (800x600)
        const resizedPreview = await resizePreviewImage(previewFile.buffer, previewFile.mimetype);
        previewImageId = await uploadToGridFS(
          resizedPreview,
          previewFile.originalname,
          { type: 'preview' }
        );
        logger.info('Preview image uploaded successfully:', previewImageId);
      } catch (error) {
        logger.error('Error processing preview image:', error);
        // Continue without preview if there's an error
      }
    } else if (file.mimetype === 'application/pdf') {
      // Only try to extract preview if it's a PDF and no preview image was uploaded
      try {
        previewImageId = await extractFirstPageAsImage(file.buffer);
        if (previewImageId) {
          logger.info('PDF preview extracted successfully:', previewImageId);
        }
      } catch (error) {
        logger.error('Error extracting PDF preview:', error);
      }
    }

    // Upload cover image if provided
    let coverImageId = null;
    if (req.files?.coverImage?.[0]) {
      coverImageId = await uploadToGridFS(
        req.files.coverImage[0].buffer,
        req.files.coverImage[0].originalname,
        { type: 'cover' }
      );
    }

    // Parse tags
    const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];

    const material = await Material.create({
      title,
      description,
      subject,
      classLevel,
      category: category || 'Class',
      priceINR: priceINR ? Number(priceINR) : 0,
      tags: tagsArray,
      pdfFileId: fileId, // Store any file type in pdfFileId field
      previewImageId,
      coverImageId,
      fileNameOriginal: fileNameOriginal || file.originalname,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      uploadedBy: req.admin.username
    });

    // Fetch the created material with all fields for response
    const createdMaterial = await Material.findById(material._id)
      .select('-pdfFileId')
      .lean();

    res.status(201).json({
      success: true,
      material: createdMaterial
    });
  } catch (error) {
    logger.error('Error creating material:', error);
    res.status(500).json({ success: false, message: 'Error creating material' });
  }
});

// Update material
router.put('/materials/:id', authenticateAdmin, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'previewImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const {
      title,
      description,
      subject,
      classLevel,
      category,
      priceINR,
      tags,
      isFeatured,
      versionNote,
      fileNameOriginal
    } = req.body;

    // Update basic fields
    if (title) material.title = title;
    if (description) material.description = description;
    if (subject) material.subject = subject;
    if (classLevel) material.classLevel = classLevel;
    if (category) material.category = category;
    if (priceINR !== undefined) material.priceINR = Number(priceINR);
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      material.tags = tagsArray;
    }
    if (isFeatured !== undefined) material.isFeatured = isFeatured === 'true' || isFeatured === true;

    // Handle new file upload (versioning) - accept any file type
    if (req.files?.file?.[0]) {
      const file = req.files.file[0];

      // Save old version
      if (material.pdfFileId) {
        material.versions.push({
          pdfFileId: material.pdfFileId,
          versionNote: versionNote || 'Previous version',
          uploadedAt: new Date()
        });
      }

      // Upload new file (any type)
      const newFileId = await uploadToGridFS(
        file.buffer,
        file.originalname,
        { type: 'document', mimeType: file.mimetype }
      );

      material.pdfFileId = newFileId;

      // Handle preview image update
      if (req.files?.previewImage?.[0]) {
        // Admin uploaded a new preview image
        const previewFile = req.files.previewImage[0];
        // Delete old preview if exists
        if (material.previewImageId) {
          try {
            await deleteFromGridFS(material.previewImageId);
          } catch (error) {
            logger.error('Error deleting old preview:', error);
          }
        }
        // Resize preview image to consistent size
        const resizedPreview = await resizePreviewImage(previewFile.buffer, previewFile.mimetype);
        material.previewImageId = await uploadToGridFS(
          resizedPreview,
          previewFile.originalname,
          { type: 'preview' }
        );
      } else if (file.mimetype === 'application/pdf') {
        // Only try to extract preview if it's a PDF and no preview image was uploaded
        const extractedPreviewId = await extractFirstPageAsImage(file.buffer);
        if (extractedPreviewId) {
          // Delete old preview if exists
          if (material.previewImageId) {
            try {
              await deleteFromGridFS(material.previewImageId);
            } catch (error) {
              logger.error('Error deleting old preview:', error);
            }
          }
          material.previewImageId = extractedPreviewId;
        }
      }

      if (fileNameOriginal) {
        material.fileNameOriginal = fileNameOriginal;
      } else {
        material.fileNameOriginal = file.originalname;
      }
    } else if (req.files?.previewImage?.[0]) {
      // Only preview image updated, no file update
      const previewFile = req.files.previewImage[0];
      // Delete old preview if exists
      if (material.previewImageId) {
        try {
          await deleteFromGridFS(material.previewImageId);
        } catch (error) {
          logger.error('Error deleting old preview:', error);
        }
      }
      // Resize preview image to consistent size
      const resizedPreview = await resizePreviewImage(previewFile.buffer, previewFile.mimetype);
      material.previewImageId = await uploadToGridFS(
        resizedPreview,
        previewFile.originalname,
        { type: 'preview' }
      );
    }

    // Handle new cover image
    if (req.files?.coverImage?.[0]) {
      const coverFile = req.files.coverImage[0];

      // Delete old cover if exists
      if (material.coverImageId) {
        try {
          await deleteFromGridFS(material.coverImageId);
        } catch (error) {
          logger.error('Error deleting old cover:', error);
        }
      }

      // Upload new cover
      const newCoverImageId = await uploadToGridFS(
        coverFile.buffer,
        coverFile.originalname,
        { type: 'cover' }
      );

      material.coverImageId = newCoverImageId;
    }

    await material.save();

    res.json({ success: true, material });
  } catch (error) {
    logger.error('Error updating material:', error);
    res.status(500).json({ success: false, message: 'Error updating material' });
  }
});

// Delete material
router.delete('/materials/:id', authenticateAdmin, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Delete all files from GridFS (current + versions)
    const fileIds = [
      material.pdfFileId,
      material.previewImageId,
      material.coverImageId,
      ...material.versions.map(v => v.pdfFileId)
    ].filter(Boolean);

    for (const fileId of fileIds) {
      try {
        await deleteFromGridFS(fileId);
      } catch (error) {
        logger.error('Error deleting file from GridFS:', error);
      }
    }

    await Material.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    logger.error('Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Error deleting material' });
  }
});

// Get all orders
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      email,
      materialId,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (email) query.buyerEmail = email.toLowerCase();
    if (materialId) query.material = materialId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('material', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// Export orders as CSV
router.get('/orders/csv', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('material', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    const headers = ['Order ID', 'Date', 'Material', 'Buyer Email', 'Buyer Mobile', 'Amount (₹)', 'Status', 'Payment ID'];
    const rows = orders.map(order => [
      order._id.toString(),
      order.createdAt.toISOString(),
      order.material?.title || 'N/A',
      order.buyerEmail,
      order.buyerMobile || 'N/A',
      order.amountPaidINR,
      order.status,
      order.razorpayPaymentId
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting orders:', error);
    res.status(500).json({ success: false, message: 'Error exporting orders' });
  }
});

// Initiate refund
router.post('/refund/:orderId', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount } = req.body; // Optional partial refund

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'refunded') {
      return res.status(400).json({ success: false, message: 'Order already refunded' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ success: false, message: 'Razorpay not configured' });
    }

    try {
      const refundAmount = amount ? Math.round(Number(amount) * 100) : undefined;
      
      const razorpay = getRazorpay();
      const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: refundAmount,
        notes: {
          reason: 'Refund requested by admin',
          orderId: order._id.toString()
        }
      });

      order.status = 'refunded';
      await order.save();

      res.json({
        success: true,
        refund,
        message: 'Refund initiated successfully'
      });
    } catch (razorpayError) {
      logger.error('Razorpay refund error:', razorpayError);
      // Still mark as refunded in our system if manual
      if (req.body.manual === 'true') {
        order.status = 'refunded';
        await order.save();
        return res.json({
          success: true,
          message: 'Order marked as refunded (manual)'
        });
      }
      throw razorpayError;
    }
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Error processing refund' });
  }
});

// Logout
router.post('/logout', authenticateAdmin, (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change admin password - DISABLED: Password changes must be done directly in database
// This endpoint is kept for backward compatibility but returns an error
router.post('/change-password', authenticateAdmin, async (req, res) => {
  return res.status(403).json({ 
    success: false, 
    message: 'Password changes are disabled. Please contact the system administrator to change your password. The administrator will update it directly in the MongoDB database.' 
  });
});

export default router;

