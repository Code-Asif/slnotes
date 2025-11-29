import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
    index: true
  },
  buyerEmail: {
    type: String,
    lowercase: true,
    required: true,
    index: true
  },
  buyerMobile: {
    type: String
  },
  amountPaidINR: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['captured', 'refunded', 'failed'],
    default: 'captured',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
orderSchema.index({ material: 1, createdAt: -1 });
orderSchema.index({ buyerEmail: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

