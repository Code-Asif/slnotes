import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { logger } from '../config/logger.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = req.cookies?.adminToken || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

