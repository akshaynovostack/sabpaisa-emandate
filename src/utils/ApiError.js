const {status: httpStatus} = require('http-status');

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    // Validate status code - ensure it's a number and a valid HTTP status code
    if (!statusCode || typeof statusCode !== 'number') {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }

    // Use default message if none provided
    if (!message) {
      message = httpStatus[statusCode] || 'Internal Server Error';
    }

    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 500 ? 'error' : 'fail';

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError; 