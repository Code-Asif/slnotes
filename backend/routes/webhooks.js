import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Material from '../models/Material.js';
import Download from '../models/Download.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Razorpay webhook handler
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      logger.warn('Webhook signature or secret missing');
      return res.status(400).json({ success: false, message: 'Missing signature or secret' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(req.body);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      logger.warn('Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    logger.info('Razorpay webhook received:', event.event);

    // Handle payment.captured event (fallback)
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Check if order already exists
      let order = await Order.findOne({ razorpayPaymentId: paymentId });

      if (!order) {
        // Try to find by order_id and create if not exists
        const notes = payment.notes || {};
        const materialId = notes.materialId;
        const email = notes.email || payment.email;
        const mobile = notes.mobile || payment.contact;

        if (materialId) {
          const material = await Material.findById(materialId);

          if (material) {
            order = await Order.create({
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId,
              material: materialId,
              buyerEmail: email,
              buyerMobile: mobile,
              amountPaidINR: material.priceINR,
              status: 'captured'
            });

            // Record download
            await Download.create({
              material: materialId,
              email,
              mobile,
              isFree: false,
              order: order._id
            });

            // Increment download count
            material.downloadCount += 1;
            await material.save();

            logger.info('Order created from webhook:', order._id);
          }
        }
      } else {
        // Update status if needed
        if (order.status !== 'captured') {
          order.status = 'captured';
          await order.save();
        }
      }
    }

    // Handle payment.refunded event
    if (event.event === 'payment.refunded') {
      const payment = event.payload.payment.entity;
      const paymentId = payment.id;

      const order = await Order.findOne({ razorpayPaymentId: paymentId });

      if (order && order.status !== 'refunded') {
        order.status = 'refunded';
        await order.save();
        logger.info('Order refunded:', order._id);
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
});

export default router;

