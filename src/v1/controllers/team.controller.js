const {status: httpStatus} = require('http-status');
const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const { success } = require('../../utils/response');
const { registerTeam } = require('../../services/auth.service');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const getTeams = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      include: {
        role: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    }),
    prisma.team.count({ where }),
  ]);

  // Remove passwords from response
  const teamsWithoutPassword = teams.map(({ password, ...team }) => team);

  return success(res, {
    message: 'Teams retrieved successfully',
    data: {
      teams: teamsWithoutPassword,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      }
    },
    meta: {
      totalCount: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    }
  });
});

const getTeam = catchAsync(async (req, res) => {

  const team = await prisma.team.findUnique({
    where: { id: req.params.teamId },
    include: {
      role: true,
    },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }

  // Remove password from response
  const { password, ...teamWithoutPassword } = team;
  
  return success(res, {
    message: 'Team member retrieved successfully',
    data: { team: teamWithoutPassword }
  });
});

const updateTeam = catchAsync(async (req, res) => {
  const { name, email, role_id } = req.body;
  const teamId = Number(req.params.teamId);

  // Check if team member exists
  const existingTeam = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!existingTeam) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }

  // If email is being updated, check for uniqueness
  if (email && email !== existingTeam.email) {
    const emailExists = await prisma.team.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  // Update team member
  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data: {
      name,
      email,
      role_id: role_id ? Number(role_id) : undefined,
      modified_date_time: new Date(),
    },
    include: {
      role: true,
    },
  });

  // Remove password from response
  const { password, ...teamWithoutPassword } = updatedTeam;
  
  return success(res, {
    message: 'Team member updated successfully',
    data: { team: teamWithoutPassword },
    meta: {
      updatedAt: updatedTeam.modified_date_time
    }
  });
});

const deleteTeam = catchAsync(async (req, res) => {
  const teamId = Number(req.params.teamId);

  // Check if team member exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }

  // Delete team member
  await prisma.team.delete({
    where: { id: teamId },
  });

  return success(res, {
    message: 'Team member deleted successfully',
    data: { id: teamId },
    meta: {
      deletedAt: new Date().toISOString()
    }
  });
});

const createTeam = catchAsync(async (req, res) => {
  const team = await registerTeam(req.body);

  return success(res, {
    message: 'Team member created successfully',
    data: { team },
    meta: {
      createdAt: team.created_at,
      updatedAt: team.modified_date_time
    }
  }, httpStatus.CREATED);
});

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
}; 