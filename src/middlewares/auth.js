const {status: httpStatus} = require('http-status');
const { roles } = require('../config/roles');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check if user has permission to access a resource
 * @param {string} action - The action to check ('read', 'create', 'update', 'delete')
 * @param {string} scope - The scope of the permission ('any', 'own')
 * @param {string} resource - The resource to check permissions for
 * @returns {Function} Express middleware function
 */
const grantAccess = (action, scope, resource) => {
  return async (req, _res, next) => {
    try {
      // eslint-disable-next-line eqeqeq
      const isOwnedTeam = req.user.id == req.params.teamId;
      const finalScope = isOwnedTeam ? 'own' : scope;
      // The accesscontrol library expects the role to be a string
      const role = roles.can(req.user.role_id.toString());
      
      // Check if the role has the requested permission
      const permission = role[action + finalScope.charAt(0).toUpperCase() + finalScope.slice(1)](resource);      
      
      if (!permission.granted) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Permission denied: ${action}${finalScope.charAt(0).toUpperCase() + finalScope.slice(1)} on ${resource}`
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { 
  grantAccess
}; 