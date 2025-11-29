import Admin from '../models/Admin.js';
import { logger } from './logger.js';

export const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.findOne();
    
    if (!adminExists && process.env.ADMIN_PASSWORD_PLAIN) {
      // Store password in plain text (no encryption)
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin@yourinstitute.com',
        password: process.env.ADMIN_PASSWORD_PLAIN, // Plain text password
        email: process.env.ADMIN_USERNAME || 'admin@yourinstitute.com'
      });
      
      logger.info('Admin user initialized successfully (plain text password)');
    }
  } catch (error) {
    logger.error('Error initializing admin:', error);
  }
};

