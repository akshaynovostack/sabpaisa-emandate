const { status: httpStatus } = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const teamService = require('./team.service');
const ApiError = require('../utils/ApiError');
const { decryptData } = require('../utils/auth');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const { tokenService } = require('./token.service');
const { emailService } = require('./email.service');
const { prisma } = require('../db/prisma');

/**
 * Login with email and password
 * @param {Object} req - Request object containing email and password
 * @returns {Promise<Object>} User object with token
 */
async function loginUserWithEmailAndPassword(req) {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
  }

  try {
    // Get user by email from team service
    const user = await teamService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
    }

    // Verify password
    const isPasswordMatch = await decryptData(password, user.password);
    if (!isPasswordMatch) {
      // Log failed login attempt
      logger.warn(`Failed login attempt for email: ${email}`);
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = await generateAuthTokens(user);

    // Remove sensitive data
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Login error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error during login');
  }
}

/**
 * Generate auth tokens
 * @param {Object} user - User object
 * @returns {Promise<Object>} Access and refresh tokens
 */
async function generateAuthTokens(user) {
  const accessTokenExpires = Date.now() + config.jwt.accessExpirationMinutes * 60 * 1000;
  const refreshTokenExpires = Date.now() + config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000;

  // Only include user ID in token
  const accessToken = jwt.sign(
    {
      sub: user.id,      // User ID for database lookup
      type: 'access'     // Token type
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.accessExpirationMinutes * 60
    }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,    // User ID
      type: 'refresh'  // Token type
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.refreshExpirationDays * 24 * 60 * 60
    }
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires,
  };
}

/**
 * Refresh auth tokens
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access and refresh tokens
 */
async function refreshAuthTokens(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, config.jwt.secret);
    if (payload.type !== 'refresh') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }
    const user = await teamService.getTeamById(payload.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    if (!user.is_active) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
    }

    return generateAuthTokens(user);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Logout and invalidate tokens
 * @param {string} refreshToken - The refresh token to invalidate
 * @param {number} userId - The ID of the user logging out
 * @returns {Promise<void>}
 */
const logout = async (refreshToken, userId) => {
  try {
    if (!refreshToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
    }

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    // Add token to blacklist
    await prisma.blacklistedToken.create({
      data: {
        token: refreshToken,
        user_id: userId,
        reason: 'LOGOUT'
      }
    });

    // Clear any active sessions for this user
    await prisma.session.deleteMany({
      where: {
        user_id: userId,
        is_active: true
      }
    });

    logger.info(`User ${userId} logged out successfully`);
  } catch (error) {
    logger.error('Logout error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error during logout');
  }
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginTeamWithEmailAndPassword = async (email, password) => {
  const team = await prisma.team.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!team) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, team.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  // Remove password from response
  const { password: _, ...teamWithoutPassword } = team;
  return teamWithoutPassword;
};

/**
 * Register a new team member
 * @param {Object} teamData
 * @returns {Promise<Object>}
 */
const registerTeam = async (teamData) => {
  const { email, password, ...rest } = teamData;

  // Check if email is already taken
  const existingTeam = await prisma.team.findUnique({
    where: { email },
  });

  if (existingTeam) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create team member
  const team = await prisma.team.create({
    data: {
      ...rest,
      email,
      password: hashedPassword,
    },
    include: {
      role: true,
    },
  });

  // Remove password from response
  const { password: _, ...teamWithoutPassword } = team;
  return teamWithoutPassword;
};

/**
 * Send reset password email
 * @param {string} email
 * @param {string} token
 * @returns {Promise<void>}
 */
const sendResetPasswordEmail = async (email, token) => {
  const team = await prisma.team.findUnique({
    where: { email },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No team member found with this email');
  }

  await emailService.sendResetPasswordEmail(email, token);
};

/**
 * Reset password
 * @param {string} token
 * @param {string} password
 * @returns {Promise<void>}
 */
const resetPassword = async (token, password) => {
  try {
    const payload = await tokenService.verifyToken(token);
    const team = await prisma.team.findUnique({
      where: { id: payload.sub },
    });

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.team.update({
      where: { id: team.id },
      data: { password: hashedPassword },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Get team member by refresh token
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const getTeamByRefreshToken = async (refreshToken) => {
  try {
    const payload = await tokenService.verifyToken(refreshToken);
    const team = await prisma.team.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
      },
    });

    if (!team) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Team member not found');
    }

    // Remove password from response
    const { password: _, ...teamWithoutPassword } = team;
    return teamWithoutPassword;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  refreshAuthTokens,
  logout,
  loginTeamWithEmailAndPassword,
  registerTeam,
  sendResetPasswordEmail,
  resetPassword,
  getTeamByRefreshToken,
}; 