const { status: httpStatus } = require('http-status');
const tokenService = require('../services/token.service');
const authService = require('../services/auth.service');
const teamService = require('../services/team.service');
const ApiError = require('../utils/ApiError');
const { roleIds } = require('../config/roles');
const logger = require('../config/logger');

/**
 * Middleware to verify access token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header is missing');
    }

    // Check if it's a Bearer token
    if (!req.headers.authorization.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid authorization format. Bearer token required');
    }

    const token = req.headers.authorization.split(' ')[1];

    // Check if token exists
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token is missing');
    }

    try {
      // First try to verify the access token
      const decoded = await tokenService.verifyAndDecodeToken(token, 'access');
      // Get user details from database
      const user = await teamService.getTeamById(decoded.sub);
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
      }
      // Validate role exists and is valid
      if (!user.role_id || !Object.values(roleIds).includes(user.role_id.toString())) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid user role');
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        role_id: user.role_id.toString(), // Convert role_id to string to match roleIds
        is_active: user.is_active
      };

      // Check if token is about to expire (e.g., within 5 minutes)
      const tokenExp = decoded.exp * 1000; // Convert to milliseconds
      const fiveMinutes = 5 * 60 * 1000;
      if (tokenExp - Date.now() < fiveMinutes) {
        // Token is about to expire, generate new tokens
        const newTokens = await authService.refreshAuthTokens(token);

        // Set new tokens in response headers
        res.setHeader('X-New-Access-Token', newTokens.accessToken);
        res.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
        res.setHeader('X-Token-Expires', newTokens.accessTokenExpires);
      }

      next();
    } catch (error) {
      logger.error('Token verification error:', error);

      // If access token verification fails, try to refresh
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }

      // If it's already an ApiError, pass it through
      if (error instanceof ApiError) {
        throw error;
      }

      // For any other error, wrap it in an ApiError
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
    }
  } catch (error) {
    logger.error('Token verification error:', error);
    next(error); // Pass the error to the error handler
  }
};

module.exports = verifyToken; 