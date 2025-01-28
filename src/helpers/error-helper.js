const logger = require('../helpers/logger');

// Common function to structure and log errors
const handleError = (error) => {
  let structuredError = {
    message: 'An error occurred',
    details: null,
    type: 'UnknownError',
    meta: null,
  };

  if (error instanceof Error) {
    logger.error('Error stack:', error.stack);

    // Handle PrismaClientKnownRequestError
    if (error.name === 'PrismaClientKnownRequestError') {
      structuredError.type = 'PrismaError';

      switch (error.code) {
        case 'P2002': // Unique constraint failed
          structuredError.message = 'Unique constraint failed';
          structuredError.details = `A unique field value is already in use: ${error.meta?.target}`;
          break;
        case 'P2003': // Foreign key constraint failed
          structuredError.message = 'Foreign key constraint failed';
          structuredError.details = 'A related record was not found or violated constraints';
          break;
        default:
          structuredError.message = 'Database error';
          structuredError.details = error.message;
          break;
      }
    } else {
      // Handle other error types
      structuredError.message = error.message || structuredError.message;
      structuredError.details = error.stack || null;
    }
  }

  return structuredError;
};

module.exports = handleError;
