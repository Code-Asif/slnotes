import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Material from '../models/Material.js';
import Order from '../models/Order.js';
import Download from '../models/Download.js';
import { verifyRecaptcha } from '../middleware/recaptcha.js';
import { checkoutLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../config/logger.js';

const router = express.Router();

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

// Free checkout
router.post('/free', checkoutLimiter, verifyRecaptcha, async (req, res) => {
  try {
    const { materialId, email, mobile } = req.body;

    if (!materialId || !email) {
      return res.status(400).json({ success: false, message: 'Material ID and email are required' });
    }

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.priceINR > 0) {
      return res.status(400).json({ success: false, message: 'This is a paid material' });
    }

    // Record download
    await Download.create({
      material: materialId,
      email,
      mobile,
      isFree: true
    });

    // Increment download count
    material.downloadCount += 1;
    await material.save();

    // Return full URL for production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
      : '';

    res.json({
      success: true,
      downloadUrl: `${baseUrl}/api/download/free/${materialId}`,
      message: 'Free material downloaded successfully'
    });
  } catch (error) {
    logger.error('Error processing free checkout:', error);
    res.status(500).json({ success: false, message: 'Error processing free checkout' });
  }
});

// Create Razorpay order
router.post('/create-order', checkoutLimiter, verifyRecaptcha, async (req, res) => {
  try {
    const { materialId, email, mobile } = req.body;

    if (!materialId || !email) {
      return res.status(400).json({ success: false, message: 'Material ID and email are required' });
    }

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.priceINR <= 0) {
      return res.status(400).json({ success: false, message: 'This is a free material' });
    }

    const amount = Math.round(material.priceINR * 100); // Convert to paise

    // Razorpay receipt must be max 40 characters
    const receipt = `mat_${materialId.toString().slice(-12)}_${Date.now().toString().slice(-8)}`.slice(0, 40);

    const razorpay = getRazorpay();
    const options = {
      amount,
      currency: 'INR',
      receipt,
      notes: {
        materialId: materialId.toString(),
        email,
        mobile: mobile || '',
        title: material.title
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    logger.error('Error creating Razorpay order:', {
      message: error.message,
      error: error.error?.description || error.description || error.toString(),
      stack: error.stack
    });
    
    // Provide more specific error messages
    let errorMessage = 'Error creating order';
    if (error.error?.description) {
      errorMessage = error.error.description;
    } else if (error.description) {
      errorMessage = error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Check if it's a Razorpay configuration error
    if (error.message && error.message.includes('Razorpay keys not configured')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage || 'Error creating order. Please try again.' 
    });
  }
});

// Verify payment and create order
router.post('/verify', checkoutLimiter, verifyRecaptcha, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      materialId,
      email,
      mobile
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !materialId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(text);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Create order in database
    const order = await Order.create({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      material: materialId,
      buyerEmail: email,
      buyerMobile: mobile,
      amountPaidINR: material.priceINR,
      status: 'captured'
    });

    // Create a download record for the order
    await Download.create({
      order: order._id,
      material: material._id,
      email: order.buyerEmail,
      mobile: order.buyerMobile,
      isFree: false
    });

    // Get base URL for production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
      : '';

    // Send success response with download URL
    res.json({
      success: true,
      order: {
        id: order._id,
        materialTitle: material.title
      },
      downloadUrl: `${baseUrl}/api/download/paid/${order._id}`,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    logger.error('Error verifying payment:', {
      message: error.message,
      error: error.toString(),
      code: error.code,
      stack: error.stack
    });
    
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error verifying payment. Please contact support if payment was deducted.' 
    });
  }
});

export default router;

