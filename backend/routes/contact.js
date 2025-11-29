import express from 'express';
import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

const router = express.Router();

// Create transporter using MailerSend SMTP
const createTransporter = () => {
  if (!process.env.MAILERSEND_SMTP_HOST || !process.env.MAILERSEND_SMTP_USER || !process.env.MAILERSEND_SMTP_PASSWORD) {
    logger.warn('MailerSend SMTP credentials not configured. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAILERSEND_SMTP_HOST || 'smtp.mailersend.net',
    port: parseInt(process.env.MAILERSEND_SMTP_PORT || '587'),
    secure: process.env.MAILERSEND_SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.MAILERSEND_SMTP_USER,
      pass: process.env.MAILERSEND_SMTP_PASSWORD,
    },
  });
};

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address' 
      });
    }

    const transporter = createTransporter();
    
    if (!transporter) {
      logger.error('Email transporter not configured');
      // In development, log the submission instead of failing
      if (process.env.NODE_ENV === 'development') {
        logger.info('=== CONTACT FORM SUBMISSION (Development Mode - Email not configured) ===');
        logger.info(`Name: ${name}`);
        logger.info(`Email: ${email}`);
        logger.info(`Subject: ${subject || 'No subject'}`);
        logger.info(`Message: ${message}`);
        logger.info('========================================');
        
        return res.json({ 
          success: true, 
          message: 'Your message has been received! (Development mode - email not configured. Check server logs.)' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Email service is not configured. Please contact the administrator.' 
      });
    }

    // Sanitize HTML to prevent XSS
    const sanitizeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Email content
    const mailOptions = {
      from: process.env.MAILERSEND_FROM_EMAIL || process.env.MAILERSEND_SMTP_USER,
      to: 'coachingwork2409@gmail.com',
      replyTo: email,
      subject: subject || `Contact Form: ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizeHtml(name)}</p>
        <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
        ${subject ? `<p><strong>Subject:</strong> ${sanitizeHtml(subject)}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${sanitizeHtml(message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This email was sent from the contact form on your website.</small></p>
        <p><small>Reply to: ${sanitizeHtml(email)}</small></p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        ${subject ? `Subject: ${subject}` : ''}
        
        Message:
        ${message}
        
        ---
        Reply to: ${email}
      `,
    };

    // Send email with timeout
    try {
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout')), 10000)
        )
      ]);
      
      logger.info(`Contact form email sent successfully from ${email}`);
      
      res.json({ 
        success: true, 
        message: 'Your message has been sent successfully! We\'ll get back to you soon.' 
      });
    } catch (sendError) {
      logger.error('Error sending email:', sendError);
      
      // Log the submission even if email fails
      logger.info('=== CONTACT FORM SUBMISSION (Email failed, but logged) ===');
      logger.info(`Name: ${name}`);
      logger.info(`Email: ${email}`);
      logger.info(`Subject: ${subject || 'No subject'}`);
      logger.info(`Message: ${message}`);
      logger.info('========================================');
      
      // In development, still return success
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          success: true, 
          message: 'Your message has been received! (Email sending failed in development. Check server logs.)' 
        });
      }
      
      throw sendError;
    }
  } catch (error) {
    logger.error('Error processing contact form:', error);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    res.status(500).json({ 
      success: false, 
      message: `Failed to send message: ${error.message || 'Please try again later or contact us directly at coachingwork2409@gmail.com'}` 
    });
  }
});

export default router;

