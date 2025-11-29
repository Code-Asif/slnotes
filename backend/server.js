import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { logger } from './config/logger.js';
import { connectDB } from './config/database.js';
import { initializeAdmin } from './config/initializeAdmin.js';

// Routes
import materialRoutes from './routes/materials.js';
import checkoutRoutes from './routes/checkout.js';
import downloadRoutes from './routes/downloads.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all localhost origins and no origin
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      if (!origin || 
          origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.includes('::1') ||
          origin.includes('192.168.') ||
          origin.includes('10.0.')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://salmannotes.netlify.app', // Netlify frontend URL
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean); // Remove undefined values
    
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.length > 0 && allowedOrigins.indexOf(origin) === -1) {
      // In development, still allow it but log a warning
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        logger.warn(`CORS: Allowing origin ${origin} in development mode`);
        return callback(null, true);
      }
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Headers',
    'Access-Control-Allow-Origin',
    'X-Razorpay-Signature'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/materials', materialRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await initializeAdmin();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

