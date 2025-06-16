const {status: httpStatus} = require('http-status');
const { getOffset } = require('../utils/query');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { prisma } = require('../db/prisma');
const logger = require('../config/logger');

/**
 * Get role by ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Role object
 */
async function getRoleById(roleId) {
  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    return role;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error getting role by ID:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving role');
  }
}

/**
 * Get role by name
 * @param {string} name - Role name
 * @returns {Promise<Object>} Role object
 */
async function getRoleByName(name) {
  try {
    const role = await prisma.role.findFirst({
      where: { name },
    });

    return role;
  } catch (error) {
    logger.error('Error getting role by name:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving role');
  }
}

/**
 * Get all roles with pagination
 * @param {Object} req - Request object containing query parameters
 * @returns {Promise<Object>} Paginated roles
 */
async function getRoles(req) {
  try {
    const { page: defaultPage, limit: defaultLimit } = config.pagination;
    const { page = defaultPage, limit = defaultLimit, search } = req.query;

    const offset = getOffset(page, limit);

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.role.count({ where });

    // Get paginated roles
    const roles = await prisma.role.findMany({
      where,
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' },
        { updatedAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    return {
      data: roles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting roles:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving roles');
  }
}

/**
 * Create a new role
 * @param {Object} req - Request object containing role data
 * @returns {Promise<Object>} Created role
 */
async function createRole(req) {
  try {
    const { name, description = '', permissions = [] } = req.body;

    // Validate input
    if (!name) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Role name is required');
    }

    // Check if role already exists
    const existingRole = await getRoleByName(name);
    if (existingRole) {
      throw new ApiError(httpStatus.CONFLICT, 'Role with this name already exists');
    }

    // Create role with permissions if provided
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map((permission) => ({
            permission: {
              connectOrCreate: {
                where: { name: permission },
                create: { name: permission },
              },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    logger.info(`Role created: ${role.name}`);
    return role;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error creating role:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating role');
  }
}

/**
 * Update a role
 * @param {Object} req - Request object containing role data and ID
 * @returns {Promise<Object>} Updated role
 */
async function updateRole(req) {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    // If name is being changed, check for conflicts
    if (name && name !== existingRole.name) {
      const roleWithSameName = await getRoleByName(name);
      if (roleWithSameName) {
        throw new ApiError(httpStatus.CONFLICT, 'Role with this name already exists');
      }
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
        ...(permissions && {
          permissions: {
            deleteMany: {},
            create: permissions.map((permission) => ({
              permission: {
                connectOrCreate: {
                  where: { name: permission },
                  create: { name: permission },
                },
              },
            })),
          },
        }),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    logger.info(`Role updated: ${updatedRole.name}`);
    return updatedRole;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating role:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating role');
  }
}

/**
 * Delete a role
 * @param {string} roleId - Role ID
 * @returns {Promise<void>}
 */
async function deleteRole(roleId) {
  try {
    // Check if role exists
    const existingRole = await getRoleById(roleId);
    if (!existingRole) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    // Check if role is assigned to any users
    const usersWithRole = await prisma.user.count({
      where: { roleId },
    });

    if (usersWithRole > 0) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Cannot delete role that is assigned to users'
      );
    }

    // Delete role and its permissions
    await prisma.role.delete({
      where: { id: roleId },
    });

    logger.info(`Role deleted: ${existingRole.name}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error deleting role:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting role');
  }
}

module.exports = {
  getRoleById,
  getRoleByName,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
}; 