import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  pdfFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  versionNote: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  classLevel: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Class', 'JEE', 'NEET', 'Foundation', 'Olympiad'],
    default: 'Class'
  },
  priceINR: {
    type: Number,
    min: 0,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  coverImageId: {
    type: mongoose.Schema.Types.ObjectId
  },
  previewImageId: {
    type: mongoose.Schema.Types.ObjectId
  },
  pdfFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  fileNameOriginal: {
    type: String
  },
  versions: [versionSchema],
  isFeatured: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
materialSchema.index({ title: 'text', description: 'text', tags: 'text' });
materialSchema.index({ classLevel: 1, category: 1, priceINR: 1 });
materialSchema.index({ isFeatured: -1 });
materialSchema.index({ createdAt: -1 });

materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Material = mongoose.model('Material', materialSchema);

export default Material;

