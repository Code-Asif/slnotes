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

// Normalise a possible string id into a proper ObjectId
const normaliseFileId = (fileId) => {
  if (!fileId) return fileId;

  if (typeof fileId === 'string') {
    try {
      return new mongoose.Types.ObjectId(fileId);
    } catch (e) {
      logger.error(`GridFS: Invalid ObjectId string "${fileId}"`, e);
      return fileId;
    }
  }

  return fileId;
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
  const normalisedId = normaliseFileId(fileId);
  return bucket.openDownloadStream(normalisedId);
};

// Get file metadata
export const getFileMetadata = async (fileId) => {
  const bucket = getGridFSBucket();
  const normalisedId = normaliseFileId(fileId);
  const files = await bucket.find({ _id: normalisedId }).toArray();
  return files[0] || null;
};

// Delete file from GridFS
export const deleteFromGridFS = async (fileId) => {
  // 1. Return immediately if no ID provided
  if (!fileId) return;

  const bucket = getGridFSBucket();
  const normalisedId = normaliseFileId(fileId);

  try {
    // 2. Use await instead of a callback. 
    // This allows the catch block to correctly handle the runtime error.
    await bucket.delete(normalisedId);
    logger.info(`GridFS: Successfully deleted file ${normalisedId}`);
    
  } catch (error) {
    // 3. Check specifically for the "File not found" error
    const message = error.message || '';
    
    if (
      message.includes('File not found for id') || 
      message.includes('FileNotFound') ||
      error.code === 'ENOENT'
    ) {
      // 4. Swallow this error. 
      // If the file is missing, our job (deleting it) is effectively done.
      logger.warn(`GridFS: File ${normalisedId} not found. Skipping delete.`);
      return; 
    }

    // 5. If it's a different error (like DB connection lost), re-throw it
    logger.error(`GridFS: Error deleting file ${normalisedId}`, error);
    throw error;
  }
};

// Check if file exists
export const fileExists = async (fileId) => {
  const bucket = getGridFSBucket();
  const normalisedId = normaliseFileId(fileId);
  const files = await bucket.find({ _id: normalisedId }).toArray();
  return files.length > 0;
};

