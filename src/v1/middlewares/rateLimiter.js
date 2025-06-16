const rateLimit = require('express-rate-limit');
const config = require('../../config/config');
const logger = require('../../config/logger');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      code: 429,
      message: options.message,
    });
  },
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      code: 429,
      message: options.message,
    });
  },
});

// Stricter rate limiter for sensitive operations
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 sensitive operations per hour
  message: 'Too many sensitive operations from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Sensitive operation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      code: 429,
      message: options.message,
    });
  },
});

// Development environment limiter (more lenient)
const devLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for development
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Export the appropriate limiter based on environment
const getLimiter = () => {
  if (config.env === 'development') {
    return devLimiter;
  }
  return apiLimiter;
};

module.exports = {
  apiLimiter: getLimiter(),
  authLimiter,
  sensitiveLimiter,
}; 