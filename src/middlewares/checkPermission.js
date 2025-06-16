const { status: httpStatus } = require('http-status');
const { resources, roleIds } = require('../config/roles');
const ApiError = require('../utils/ApiError');
const { grantAccess } = require('./auth');

/**
 * Middleware factory to check permissions based on resource and action
 * @param {string} resource - The resource to check permissions for (e.g., 'TEAM', 'MANDATE')
 * @param {Object} options - Configuration options
 * @param {string} options.action - The action to check ('read', 'create', 'update', 'delete')
 * @param {boolean} [options.allowOwn=true] - Whether to allow access to own resources
 * @param {string} [options.idParam='id'] - The parameter name containing the resource ID
 * @returns {Function} Express middleware function
 */
const checkPermission = (resource, { action, allowOwn = true, idParam = 'id' }) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }

      // Validate user role
      if (!req.user.role_id || !Object.values(roleIds).includes(req.user.role_id.toString())) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid user role');
      }

      const isAdmin = req.user.role_id.toString() === roleIds.ADMIN;
      const resourceId = req.params[idParam];
      const isOwnResource = allowOwn && resourceId && resourceId === req.user.id;

      // Determine the permission scope
      let scope;
      if (isAdmin) {
        scope = 'any';
      } else if (isOwnResource) {
        scope = 'own';
      } else {
        scope = 'own';
      }

      // Apply the permission check using grantAccess
      return grantAccess(action, scope, resources[resource])(req, res, next);
    } catch (error) {
      console.log(error)
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(httpStatus.FORBIDDEN, 'Access denied'));
      }
    }
  };
};

module.exports = checkPermission; 