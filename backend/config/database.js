import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your_mongodb')) {
      throw new Error('MONGODB_URI is not configured. Please set a valid MongoDB connection string in your .env file.');
    }   
    
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    logger.error('Please check your MONGODB_URI in the .env file');
    process.exit(1);
  }
};

// GridFS setup
let gridFSBucket;
mongoose.connection.once('open', () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'materials'
  });
  logger.info('GridFS bucket initialized');
});

export { gridFSBucket };

