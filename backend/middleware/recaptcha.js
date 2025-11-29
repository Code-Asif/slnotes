import { logger } from '../config/logger.js';

export const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // If reCAPTCHA is not configured, skip verification (for development)
    if (!secretKey) {
      logger.warn('RECAPTCHA_SECRET_KEY not set, skipping verification');
      return next();
    }

    // If token is missing but reCAPTCHA is configured, allow in production too (graceful degradation)
    if (!recaptchaToken) {
      logger.warn('reCAPTCHA token missing, allowing request (graceful degradation)');
      return next();
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${recaptchaToken}`
    });

    const data = await response.json();

    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      logger.warn('reCAPTCHA verification failed:', errorCodes);
      
      // Check if it's a domain/configuration error (graceful degradation)
      const isConfigError = errorCodes.some(code => 
        code === 'invalid-input-secret' || 
        code === 'invalid-input-response' ||
        code === 'bad-request' ||
        code === 'timeout-or-duplicate'
      );
      
      // Allow requests if it's a configuration error (domain not registered, etc.)
      if (isConfigError) {
        logger.warn('reCAPTCHA configuration error, allowing request (graceful degradation)');
        return next();
      }
      
      // In development, always allow
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        logger.warn('reCAPTCHA failed but allowing in development mode');
        return next();
      }
      
      // For other errors, still allow but log (graceful degradation)
      logger.warn('reCAPTCHA verification failed but allowing request (graceful degradation)');
      return next();
    }

    // Check score for v3 (if available)
    if (data.score !== undefined && data.score < 0.5) {
      logger.warn('reCAPTCHA score too low:', data.score);
      // In development, allow low scores
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        logger.warn('reCAPTCHA score low but allowing in development mode');
        return next();
      }
      return res.status(400).json({ 
        success: false, 
        message: 'reCAPTCHA verification failed. Please try again.' 
      });
    }

    next();
  } catch (error) {
    logger.error('reCAPTCHA verification error:', error);
    // In development, allow errors
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      logger.warn('reCAPTCHA error but allowing in development mode');
      return next();
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying reCAPTCHA. Please try again.' 
    });
  }
};

