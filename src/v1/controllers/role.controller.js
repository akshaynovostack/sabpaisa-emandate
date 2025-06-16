const {status: httpStatus} = require('http-status');
const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const { success, error } = require('../../utils/response');
const logger = require('../../helpers/logger');
const prisma = new PrismaClient();

const createRole = catchAsync(async (req, res) => {
  const { name, description } = req.body;

  // Check if role with same name exists
  const existingRole = await prisma.role.findFirst({
    where: { name },
  });

  if (existingRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role with this name already exists');
  }

  const role = await prisma.role.create({
    data: {
      name,
      description,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  logger.info('Role created successfully', { id: role.id });
  return success(res, {
    message: 'Role created successfully',
    data: { role },
    code: httpStatus.CREATED
  });
});

const getRoles = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        created_at: 'desc',
      }
    }),
    prisma.role.count({ where }),
  ]);

  logger.info('Roles retrieved successfully', { count: roles.length });
  return success(res, {
    message: 'Roles retrieved successfully',
    data: {
      roles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      }
    }
  });
});

const getRole = catchAsync(async (req, res) => {
  const role = await prisma.role.findUnique({
    where: { id: Number(req.params.roleId) },
    include: {
      _count: {
        select: {
          team: true, // Count of team members with this role
        },
      },
    },
  });

  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  logger.info('Role retrieved successfully', { id: role.id });
  return success(res, {
    message: 'Role retrieved successfully',
    data: { role }
  });
});

const updateRole = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const roleId = Number(req.params.roleId);

  // Check if role exists
  const existingRole = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!existingRole) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // If name is being updated, check for uniqueness
  if (name && name !== existingRole.name) {
    const nameExists = await prisma.role.findFirst({
      where: { name },
    });
    if (nameExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Role with this name already exists');
    }
  }

  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      name,
      description,
      updated_at: new Date(),
    },
    include: {
      _count: {
        select: {
          team: true,
        },
      },
    },
  });

  logger.info('Role updated successfully', { id: role.id });
  return success(res, {
    message: 'Role updated successfully',
    data: { role }
  });
});

const deleteRole = catchAsync(async (req, res) => {
  const roleId = Number(req.params.roleId);

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      _count: {
        select: {
          team: true,
        },
      },
    },
  });

  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // Check if role is assigned to any team members
  if (role._count.team > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete role that is assigned to team members'
    );
  }

  await prisma.role.delete({
    where: { id: roleId },
  });

  logger.info('Role deleted successfully', { id: roleId });
  return success(res, {
    message: 'Role deleted successfully',
    data: { success: true }
  });
});

module.exports = {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
}; 