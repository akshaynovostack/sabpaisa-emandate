const {status: httpStatus} = require('http-status');
const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../../utils/catchAsync');
const { authService, emailService, tokenService } = require('../../services');
const { verifyToken } = require('../../utils/auth');
const { hashPassword, comparePassword } = require('../../utils/password');
const ApiError = require('../../utils/ApiError');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { success, error } = require('../../utils/response');
const { refreshAuthTokens } = require('../../services/auth.service');

const register = catchAsync(async (req, res) => {
  const { name, email, password, roleId } = req.body;

  // Validate required fields
  if (!name || !email || !password || !roleId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');
  }

  // Check if team member already exists
  const existingTeam = await prisma.team.findUnique({
    where: { email },
  });

  if (existingTeam) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new team member
  const team = await prisma.team.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: Number(roleId), // Ensure roleId is a number
      mobile: req.body.mobile, // Optional field
      description: req.body.description, // Optional field
    },
    include: {
      role: true, // Include role details in response
    },
  });

  const tokens = await tokenService.generateAuthTokens({
    userId: team.id,
    roleId: team.roleId,
  });

  // Remove password from response
  const { password: _, ...teamWithoutPassword } = team;
  
  return success(res, {
    message: 'Team member registered successfully',
    data: { team: teamWithoutPassword },
    token: tokens,
    meta: {
      code: httpStatus.CREATED
    }
  }, httpStatus.CREATED);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const team = await authService.loginTeamWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(team);
  
  return success(res, {
    message: 'Login successful',
    data: { team },
    token: tokens,
    meta: {
      code: httpStatus.OK
    }
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken, req.user.id);
  
  return success(res, {
    message: 'Logged out successfully',
    meta: {
      code: httpStatus.OK
    }
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const teamId = req.user.id;

  // Find team member
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, team.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.team.update({
    where: { id: teamId },
    data: {
      password: hashedPassword,
      modified_date_time: new Date(),
    },
  });

  return success(res, {
    message: 'Password changed successfully',
    meta: {
      code: httpStatus.OK,
      updatedAt: new Date().toISOString()
    }
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await authService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  
  return success(res, {
    message: 'Password reset email sent successfully',
    meta: {
      code: httpStatus.OK
    }
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  
  return success(res, {
    message: 'Password reset successful',
    meta: {
      code: httpStatus.OK
    }
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await refreshAuthTokens(req.body.refreshToken);
  const team = await authService.getTeamByRefreshToken(req.body.refreshToken);
  
  return success(res, {
    message: 'Tokens refreshed successfully',
    data: { team },
    token: tokens,
    meta: {
      code: httpStatus.OK
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshTokens,
}; 