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

// Delete file from GridFS with comprehensive error handling
export const deleteFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    // Silently resolve if fileId is null/undefined
    if (!fileId) {
      return resolve();
    }

    try {
      const bucket = getGridFSBucket();
      const normalisedId = normaliseFileId(fileId);

      // Guard against both sync and async errors from the driver
      try {
        bucket.delete(normalisedId, (error) => {
          if (!error) {
            logger.info(`GridFS: successfully deleted file ${normalisedId}`);
            return resolve();
          }

          // If the file is already missing, log and treat as a successful delete
          const message = error?.message || '';
          if (
            error?.name === 'MongoRuntimeError' &&
            (message.includes('File not found for id') || message.includes('no such file or directory'))
          ) {
            logger.warn(`GridFS: file not found (already deleted or doesn't exist) - ${normalisedId}`);
            return resolve();
          }

          // Log other errors but still resolve to prevent cascade failures
          logger.error(`GridFS: error deleting file ${normalisedId}:`, error);
          return resolve();
        });
      } catch (syncError) {
        const message = syncError?.message || '';
        if (
          syncError?.name === 'MongoRuntimeError' &&
          (message.includes('File not found for id') || message.includes('no such file or directory'))
        ) {
          logger.warn(`GridFS: sync error - file not found - ${normalisedId}`);
          return resolve();
        }
        logger.error(`GridFS: sync error deleting file ${normalisedId}:`, syncError);
        return resolve();
      }
    } catch (error) {
      logger.error(`GridFS: delete operation failed for file:`, error);
      // Resolve instead of rejecting to prevent cascade failures
      resolve();
    }
  });
};

// Check if file exists
export const fileExists = async (fileId) => {
  const bucket = getGridFSBucket();
  const normalisedId = normaliseFileId(fileId);
  const files = await bucket.find({ _id: normalisedId }).toArray();
  return files.length > 0;
};

