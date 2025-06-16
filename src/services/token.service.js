const {status: httpStatus} = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const teamService = require('./team.service');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn) => {
  try {
    console.log(payload)
    const options = {
      expiresIn,
      algorithm: 'HS256',
    };

    // Only add issuer and audience if they are configured
    if (config.jwt.issuer) {
      options.issuer = config.jwt.issuer;
    }
    if (config.jwt.audience) {
      options.audience = config.jwt.audience;
    }

    return jwt.sign(payload, config.jwt.secret, options);
  } catch (error) {
    logger.error('Error generating token:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error generating token');
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const options = {
      algorithms: ['HS256'],
    };

    // Only add issuer and audience if they are configured
    if (config.jwt.issuer) {
      options.issuer = config.jwt.issuer;
    }
    if (config.jwt.audience) {
      options.audience = config.jwt.audience;
    }

    return jwt.verify(token, config.jwt.secret, options);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
    }

    throw error;
  }
};

/**
 * Generate reset password token
 * @param {string} email - Team's email
 * @returns {Promise<Object>} Reset password token and expiration
 */
async function generateResetPasswordToken(email) {
  try {
    const team = await teamService.getTeamByEmail(email);
    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found with this email');
    }

    const expiresIn = config.jwt.resetPasswordExpirationMinutes * 60; // Convert to seconds
    const payload = {
      sub: team.id,
      email: team.email,
      type: 'reset_password',
    };

    const token = generateToken(payload, expiresIn);
    const expires = Date.now() + expiresIn * 1000;

    // Log token generation
    logger.info(`Reset password token generated for team: ${team.email}`);

    return {
      token,
      expires,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error generating reset password token:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error generating reset password token');
  }
}

/**
 * Generate authentication tokens
 * @param {Object} team - Team object
 * @param {string} team.id - Team ID
 * @param {string} team.roleId - Role ID
 * @returns {Promise<Object>} Access and refresh tokens
 */
async function generateAuthTokens(team) {
  try {
    // Generate refresh token
    const refreshExpiresIn = config.jwt.refreshExpirationDays * 24 * 60 * 60; // Convert to seconds
    const refreshPayload = {
      sub: team.id,
      type: 'refresh',
    };
    const refreshToken = generateToken(refreshPayload, refreshExpiresIn);
    const refreshExpires = Date.now() + refreshExpiresIn * 1000;

    // Generate access token
    const accessExpiresIn = config.jwt.accessExpirationMinutes * 60; // Convert to seconds
    const accessPayload = {
      sub: team.id,
      role: team.roleId,
      type: 'access',
    };
    const accessToken = generateToken(accessPayload, accessExpiresIn);
    const accessExpires = Date.now() + accessExpiresIn * 1000;

    // Log token generation
    logger.info(`Auth tokens generated for team: ${team.id}`);

    return {
      refresh: {
        token: refreshToken,
        expires: refreshExpires,
      },
      access: {
        token: accessToken,
        expires: accessExpires,
      },
    };
  } catch (error) {
    logger.error('Error generating auth tokens:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error generating auth tokens');
  }
}

/**
 * Generate email verification token
 * @param {string} email - Team's email
 * @returns {Promise<Object>} Verification token and expiration
 */
async function generateEmailVerificationToken(email) {
  try {
    const team = await teamService.getTeamByEmail(email);
    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found with this email');
    }

    const expiresIn = config.jwt.verifyEmailExpirationMinutes * 60; // Convert to seconds
    const payload = {
      sub: team.id,
      email: team.email,
      type: 'email_verification',
    };

    const token = generateToken(payload, expiresIn);
    const expires = Date.now() + expiresIn * 1000;

    logger.info(`Email verification token generated for team: ${team.email}`);

    return {
      token,
      expires,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error generating email verification token:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error generating email verification token');
  }
}

/**
 * Verify and decode a token
 * @param {string} token - Token to verify
 * @param {string} type - Expected token type
 * @returns {Object} Decoded token payload
 */
async function verifyAndDecodeToken(token, type) {
  try {
    const decoded = verifyToken(token);
    
    if (decoded.type !== type) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid token type. Expected: ${type}`);
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error verifying token:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
}

module.exports = {
  generateToken,
  verifyToken,
  generateResetPasswordToken,
  generateAuthTokens,
  generateEmailVerificationToken,
  verifyAndDecodeToken,
}; 