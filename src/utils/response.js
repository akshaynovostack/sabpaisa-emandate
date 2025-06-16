const {status: httpStatus} = require('http-status');

/**
 * Send a standardized response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 */
const sendResponse = (res, {
  status = true,
  message = '',
  code = httpStatus.OK,
  data = {},
  token = '',
  meta = {}
} = {}) => {
  const response = {
    meta: {
      status,
      message,
      code,
      ...meta
    },
    data,
    ...(token && { token })
  };

  return res.status(code).json(response);
};

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 */
const success = (res, {
  message = 'Success',
  code = httpStatus.OK,
  data = {},
  token = '',
  meta = {}
} = {}) => {
  return sendResponse(res, {
    status: true,
    message,
    code,
    data,
    token,
    meta
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 */
const error = (res, {
  message = 'Error',
  code = httpStatus.INTERNAL_SERVER_ERROR,
  data = {},
  meta = {}
} = {}) => {
  return sendResponse(res, {
    status: false,
    message,
    code,
    data,
    meta
  });
};

module.exports = {
  success,
  error
}; 