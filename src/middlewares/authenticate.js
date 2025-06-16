const verifyToken = require('./verifyToken');
const checkPermission = require('./checkPermission');

/**
 * Middleware to authenticate and check permissions in one go
 * @param {string} resource - The resource to check permissions for
 * @param {Object} options - Permission options (action, allowOwn, etc)
 */
const authenticate = (resource, options) => {
  return [verifyToken, checkPermission(resource, options)];
};

module.exports = authenticate; 