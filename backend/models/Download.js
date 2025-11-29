import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    index: true
  },
  mobile: {
    type: String
  },
  isFree: {
    type: Boolean,
    default: true,
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
downloadSchema.index({ material: 1, downloadedAt: -1 });
downloadSchema.index({ email: 1, downloadedAt: -1 });

const Download = mongoose.model('Download', downloadSchema);

export default Download;

