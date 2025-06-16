const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const {status: httpStatus} = require('http-status');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure, // true for 465, false for other ports
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
  pool: true, // use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // 1 second
  rateLimit: 5, // 5 messages per second
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP connection error:', error);
  } else {
    logger.info('SMTP server is ready to take our messages');
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - HTML content
 * @param {Array} [options.attachments] - Email attachments
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${config.email.from.name} <${config.email.from.address}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error sending email');
  }
};

/**
 * Send reset password email
 * @param {string} to - Recipient email
 * @param {string} token - Reset password token
 * @returns {Promise<Object>} Send result
 */
const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const subject = 'Reset Password';
  const text = `To reset your password, click on this link: ${resetUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in ${config.jwt.resetPasswordExpirationMinutes} minutes.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        ${resetUrl}
      </p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
};

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Send result
 */
const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
  const subject = 'Verify Your Email';
  const text = `To verify your email, click on this link: ${verifyUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Welcome! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" 
           style="background-color: #2196F3; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>This link will expire in ${config.jwt.verifyEmailExpirationMinutes} minutes.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        ${verifyUrl}
      </p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} Send result
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Our Platform';
  const text = `Welcome ${name}! Thank you for joining our platform.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Our Platform!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>Here are a few things you can do to get started:</p>
      <ul style="color: #666;">
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with other members</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message, please do not reply.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
}; 