import mongoose from 'mongoose';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

let gridFSBucket;

export const initializeGridFS = (db) => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'materials'
  });
  logger.info('GridFS bucket initialized');
  return gridFSBucket;
};

export const getGridFSBucket = () => {
  if (!gridFSBucket) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'materials'
    });
  }
  return gridFSBucket;
};

// Upload file to GridFS
export const uploadToGridFS = (fileBuffer, filename, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const readableStream = Readable.from(fileBuffer);
    
    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      metadata: {
        originalName: filename,
        ...metadata
      }
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });
  });
};

// Download file from GridFS
export const downloadFromGridFS = (fileId) => {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(fileId);
};

// Get file metadata
export const getFileMetadata = async (fileId) => {
  const bucket = getGridFSBucket();
  const files = await bucket.find({ _id: fileId }).toArray();
  return files[0] || null;
};

// Delete file from GridFS
export const deleteFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    bucket.delete(fileId, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

// Check if file exists
export const fileExists = async (fileId) => {
  const bucket = getGridFSBucket();
  const files = await bucket.find({ _id: fileId }).toArray();
  return files.length > 0;
};

