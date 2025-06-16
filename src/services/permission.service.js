const { PrismaClient } = require('@prisma/client');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = new PrismaClient();

/**
 * Create a permission
 * @param {Object} permissionBody
 * @returns {Promise<Object>}
 */
const createPermission = async (permissionBody) => {
  if (await prisma.permission.findUnique({ where: { name: permissionBody.name } })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Permission name already taken');
  }
  return prisma.permission.create({
    data: permissionBody,
  });
};

/**
 * Get permission by id
 * @param {string} id
 * @returns {Promise<Object>}
 */
const getPermissionById = async (id) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  return permission;
};

/**
 * Get all permissions
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getAllPermissions = async (filter, options) => {
  const { skip, take } = options;
  const permissions = await prisma.permission.findMany({
    where: filter,
    skip,
    take,
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
  const total = await prisma.permission.count({ where: filter });
  return { permissions, total };
};

/**
 * Update permission by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updatePermissionById = async (id, updateBody) => {
  const permission = await getPermissionById(id);
  if (updateBody.name && (await prisma.permission.findUnique({ where: { name: updateBody.name } }))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Permission name already taken');
  }
  const updatedPermission = await prisma.permission.update({
    where: { id },
    data: updateBody,
  });
  return updatedPermission;
};

/**
 * Delete permission by id
 * @param {string} id
 * @returns {Promise<Object>}
 */
const deletePermissionById = async (id) => {
  const permission = await getPermissionById(id);
  // Check if permission is assigned to any roles
  if (permission.roles.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete permission that is assigned to roles. Remove role assignments first.'
    );
  }
  await prisma.permission.delete({ where: { id } });
  return permission;
};

module.exports = {
  createPermission,
  getPermissionById,
  getAllPermissions,
  updatePermissionById,
  deletePermissionById,
}; 