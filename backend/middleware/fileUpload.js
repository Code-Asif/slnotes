import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { logger } from '../config/logger.js';

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: file.originalname,
        bucketName: 'uploads',
        metadata: {
          uploadedBy: req.admin?.id || null,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        },
      };
      resolve(fileInfo);
    });
  },
});

// File filter for PDFs and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed.'), false);
  }
};

// Initialize upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Middleware to handle single file upload
const uploadFile = (fieldName) => (req, res, next) => {
  const uploadSingle = upload.single(fieldName);
  
  uploadSingle(req, res, (err) => {
    if (err) {
      logger.error('File upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file',
      });
    }
    next();
  });
};

// Middleware to handle multiple file uploads
const uploadFiles = (fieldName, maxCount = 5) => (req, res, next) => {
  const uploadMultiple = upload.array(fieldName, maxCount);
  
  uploadMultiple(req, res, (err) => {
    if (err) {
      logger.error('Multiple file upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading files',
      });
    }
    next();
  });
};

// Utility to delete a file from GridFS
const deleteFile = async (fileId) => {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error('Invalid file ID');
  }

  const bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });

  return new Promise((resolve, reject) => {
    bucket.delete(new mongoose.Types.ObjectId(fileId), (err) => {
      if (err) {
        logger.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

export { uploadFile, uploadFiles, deleteFile };
