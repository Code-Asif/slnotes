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

// Upload file to GridFS with validation
export const uploadToGridFS = (fileBuffer, filename, metadata = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      const uniqueFilename = `${uuidv4()}-${filename}`;
      const readableStream = Readable.from(fileBuffer);
      let uploadId = null;
      
      const uploadStream = bucket.openUploadStream(uniqueFilename, {
        metadata: {
          originalName: filename,
          uploadedAt: new Date(),
          ...metadata
        }
      });

      readableStream.pipe(uploadStream);

      uploadStream.on('finish', async () => {
        uploadId = uploadStream.id;
        logger.info(`GridFS: file uploaded successfully - ${uploadId} (${filename})`);
        
        // Verify file actually exists in GridFS
        try {
          const filesCollection = bucket.bucket.collectionName === 'materials' ? 
            mongoose.connection.db.collection('materials.files') :
            mongoose.connection.db.collection('fs.files');
          
          const fileExists = await filesCollection.findOne({ _id: uploadId });
          
          if (!fileExists) {
            logger.error(`GridFS: file verification failed - file not found after upload - ${uploadId}`);
            return reject(new Error('File upload verification failed - file not found'));
          }
          
          logger.info(`GridFS: file verification passed - ${uploadId}`);
          resolve(uploadId);
        } catch (verifyError) {
          logger.warn(`GridFS: file verification check failed (will continue): ${verifyError?.message}`);
          // Still resolve the upload since the file was acknowledged by GridFS
          resolve(uploadId);
        }
      });

      uploadStream.on('error', (error) => {
        logger.error(`GridFS: upload stream error - ${filename}:`, error?.message);
        reject(error);
      });

      readableStream.on('error', (error) => {
        logger.error(`GridFS: read stream error - ${filename}:`, error?.message);
        reject(error);
      });
    } catch (error) {
      logger.error(`GridFS: upload initialization error - ${filename}:`, error?.message);
      reject(error);
    }
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

// Delete file from GridFS - using direct MongoDB deletion instead of GridFS callback
export const deleteFromGridFS = async (fileId) => {
  // Silently return if fileId is null/undefined
  if (!fileId) {
    return { success: true, skipped: true };
  }

  try {
    const db = mongoose.connection.db;
    const normalisedId = normaliseFileId(fileId);
    
    if (!db) {
      logger.error('GridFS: database connection not available');
      return { success: false, error: 'Database not connected' };
    }

    // Get the files collection directly
    const filesCollection = db.collection('materials.files');
    const chunksCollection = db.collection('materials.chunks');

    // Try to delete the file and chunks - don't throw on missing files
    try {
      // Delete file document
      const fileDeleteResult = await filesCollection.deleteOne({ _id: normalisedId });
      
      // Delete associated chunks
      const chunksDeleteResult = await chunksCollection.deleteMany({ files_id: normalisedId });
      
      if (fileDeleteResult.deletedCount > 0) {
        logger.info(`GridFS: successfully deleted file ${normalisedId}`);
        return { success: true, deleted: true };
      } else {
        logger.warn(`GridFS: file not found (already deleted or doesn't exist) - ${normalisedId}`);
        return { success: true, notFound: true };
      }
    } catch (deleteError) {
      logger.error(`GridFS: error during file deletion ${normalisedId}:`, deleteError?.message);
      // Even if there's an error, don't reject - just log it
      return { success: false, error: deleteError?.message };
    }
  } catch (error) {
    logger.error(`GridFS: delete operation failed:`, error?.message);
    // Always return success to prevent cascade failures
    return { success: false, error: error?.message };
  }
};

// Check if file exists
export const fileExists = async (fileId) => {
  const bucket = getGridFSBucket();
  const normalisedId = normaliseFileId(fileId);
  const files = await bucket.find({ _id: normalisedId }).toArray();
  return files.length > 0;
};

