const {status: httpStatus} = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { error } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  // Convert error to ApiError if needed
  let convertedError = err;
  if (!(convertedError instanceof ApiError)) {
    const statusCode =
      convertedError.statusCode || convertedError instanceof Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = convertedError.message || httpStatus[statusCode];
    convertedError = new ApiError(statusCode, message, false, err.stack);
  }

  // Handle the error
  let { statusCode, message } = convertedError;
  if (config.env === 'production' && !convertedError.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = convertedError.message;

  if (config.env === 'development') {
    logger.error(convertedError);
  }

  return error(res, {
    message,
    code: statusCode,
    meta: {
      ...(config.env === 'development' && { stack: convertedError.stack })
    }
  });
};

module.exports = errorMiddleware; 