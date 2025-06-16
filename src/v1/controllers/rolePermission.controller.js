const {status: httpStatus} = require('http-status');
const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const { success } = require('../../utils/response');
const logger = require('../../config/logger');
const prisma = new PrismaClient();

const createRolePermission = catchAsync(async (req, res) => {
  const { role_id, permission_id } = req.body;

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: role_id },
  });

  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // Check if permission exists
  const permission = await prisma.permission.findUnique({
    where: { id: permission_id },
  });

  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }

  // Check if role-permission mapping already exists
  const existingMapping = await prisma.role_permission.findFirst({
    where: {
      role_id,
      permission_id,
    },
  });

  if (existingMapping) {
    throw new ApiError(httpStatus.CONFLICT, 'Role permission mapping already exists');
  }

  // Create role permission mapping
  const rolePermission = await prisma.role_permission.create({
    data: {
      role_id,
      permission_id,
    },
    include: {
      role: true,
      permission: true,
    },
  });

  logger.info('Role permission created successfully', { id: rolePermission.id });
  return success(res, {
    message: 'Role permission created successfully',
    data: { rolePermission },
    code: httpStatus.CREATED,
  });
});

const getRolePermissions = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role_id, permission_id } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (role_id) where.role_id = Number(role_id);
  if (permission_id) where.permission_id = permission_id;

  const [rolePermissions, total] = await Promise.all([
    prisma.role_permission.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      include: {
        role: true,
        permission: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    }),
    prisma.role_permission.count({ where }),
  ]);

  logger.info('Role permissions retrieved successfully', { count: rolePermissions.length });
  return success(res, {
    message: 'Role permissions retrieved successfully',
    data: {
      rolePermissions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

const getRolePermission = catchAsync(async (req, res) => {
  const { rolePermissionId } = req.params;

  const rolePermission = await prisma.role_permission.findUnique({
    where: { id: rolePermissionId },
    include: {
      role: true,
      permission: true,
    },
  });

  if (!rolePermission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role permission not found');
  }

  logger.info('Role permission retrieved successfully', { id: rolePermissionId });
  return success(res, {
    message: 'Role permission retrieved successfully',
    data: { rolePermission },
  });
});

const updateRolePermission = catchAsync(async (req, res) => {
  const { rolePermissionId } = req.params;
  const { role_id, permission_id } = req.body;

  // Check if role permission exists
  const existingRolePermission = await prisma.role_permission.findUnique({
    where: { id: rolePermissionId },
  });

  if (!existingRolePermission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role permission not found');
  }

  // If role_id is being updated, check if role exists
  if (role_id) {
    const role = await prisma.role.findUnique({
      where: { id: role_id },
    });
    if (!role) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }
  }

  // If permission_id is being updated, check if permission exists
  if (permission_id) {
    const permission = await prisma.permission.findUnique({
      where: { id: permission_id },
    });
    if (!permission) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
    }
  }

  // Check for duplicate mapping if either role_id or permission_id is being updated
  if (role_id || permission_id) {
    const duplicateMapping = await prisma.role_permission.findFirst({
      where: {
        role_id: role_id || existingRolePermission.role_id,
        permission_id: permission_id || existingRolePermission.permission_id,
        id: { not: rolePermissionId },
      },
    });

    if (duplicateMapping) {
      throw new ApiError(httpStatus.CONFLICT, 'Role permission mapping already exists');
    }
  }

  // Update role permission
  const updatedRolePermission = await prisma.role_permission.update({
    where: { id: rolePermissionId },
    data: {
      role_id: role_id ? Number(role_id) : undefined,
      permission_id,
    },
    include: {
      role: true,
      permission: true,
    },
  });

  logger.info('Role permission updated successfully', { id: rolePermissionId });
  return success(res, {
    message: 'Role permission updated successfully',
    data: { rolePermission: updatedRolePermission },
  });
});

const deleteRolePermission = catchAsync(async (req, res) => {
  const { rolePermissionId } = req.params;

  // Check if role permission exists
  const rolePermission = await prisma.role_permission.findUnique({
    where: { id: rolePermissionId },
  });

  if (!rolePermission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role permission not found');
  }

  // Delete role permission
  await prisma.role_permission.delete({
    where: { id: rolePermissionId },
  });

  logger.info('Role permission deleted successfully', { id: rolePermissionId });
  return success(res, {
    message: 'Role permission deleted successfully',
    data: { id: rolePermissionId },
  });
});

module.exports = {
  createRolePermission,
  getRolePermissions,
  getRolePermission,
  updateRolePermission,
  deleteRolePermission,
}; 