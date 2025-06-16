const {status: httpStatus} = require('http-status');
const { getOffset } = require('../utils/query');
const ApiError = require('../utils/ApiError');
const { prisma } = require('../db/prisma');
const logger = require('../config/logger');
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * Get team by ID
 * @param {string} teamId - Team ID (UUID)
 * @returns {Promise<Object>} Team object with members
 */
async function getTeamById(teamId) {
  try {
    // Validate UUID format
    if (!teamId || typeof teamId !== 'string') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid team ID format');
    }

    const team = await prisma.team.findUnique({
      where: { 
        id: teamId // teamId is already a string (UUID)
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        description: true,
        is_active: true,
        role_id: true,
        created_at: true,
        updated_at: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    return team;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error getting team by ID:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving team');
  }
}

/**
 * Get team by name
 * @param {string} name - Team name
 * @returns {Promise<Object>} Team object
 */
async function getTeamByName(name) {
  try {
    const team = await prisma.team.findFirst({
      where: { name },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return team;
  } catch (error) {
    logger.error('Error getting team by name:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving team');
  }
}

/**
 * Create a new team
 * @param {Object} req - Request object containing team data
 * @returns {Promise<Object>} Created team
 */
async function createTeam(req) {
  try {
    const { name, email, password, roleId, description, leaderId, memberIds = [], mobile } = req.body;

    // Validate required fields
    if (!name || !email || !password || !roleId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Team name, email, password and role are required');
    }

    // Check if team name already exists
    const existingTeamByName = await getTeamByName(name);
    if (existingTeamByName) {
      throw new ApiError(httpStatus.CONFLICT, 'Team with this name already exists');
    }

    // Check if email already exists
    const existingTeamByEmail = await getTeamByEmail(email);
    if (existingTeamByEmail) {
      throw new ApiError(httpStatus.CONFLICT, 'Team with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create team with members
    const team = await prisma.team.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: Number(roleId), // Ensure roleId is a number
        description,
        mobile,
        leaderId: leaderId ? Number(leaderId) : undefined, // Optional leader
        members: memberIds.length > 0 ? {
          create: memberIds.map((userId) => ({
            user: {
              connect: { id: Number(userId) }, // Ensure userId is a number
            },
          })),
        } : undefined,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        role: true,
      },
    });

    logger.info(`Team created: ${team.name}`);
    return team;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error creating team:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating team');
  }
}

/**
 * Get all teams with pagination
 * @param {Object} req - Request object containing query parameters
 * @returns {Promise<Object>} Paginated teams
 */
async function getTeams(req) {
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
    const total = await prisma.team.count({ where });

    // Get paginated teams
    const teams = await prisma.team.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' },
        { updatedAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    return {
      data: teams,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting teams:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving teams');
  }
}

/**
 * Update a team
 * @param {Object} req - Request object containing team data and ID
 * @returns {Promise<Object>} Updated team
 */
async function updateTeam(req) {
  try {
    const { teamId } = req.params;
    const { name, description, leaderId, memberIds } = req.body;

    // Check if team exists
    const existingTeam = await getTeamById(teamId);
    if (!existingTeam) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    // If name is being changed, check for conflicts
    if (name && name !== existingTeam.name) {
      const teamWithSameName = await getTeamByName(name);
      if (teamWithSameName) {
        throw new ApiError(httpStatus.CONFLICT, 'Team with this name already exists');
      }
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description,
        leaderId,
        ...(memberIds && {
          members: {
            deleteMany: {},
            create: memberIds.map((userId) => ({
              user: {
                connect: { id: userId },
              },
            })),
          },
        }),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Team updated: ${updatedTeam.name}`);
    return updatedTeam;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating team:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating team');
  }
}

/**
 * Delete a team
 * @param {string} teamId - Team ID
 * @returns {Promise<void>}
 */
async function deleteTeam(teamId) {
  try {
    // Check if team exists
    const existingTeam = await getTeamById(teamId);
    if (!existingTeam) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
    }

    // Delete team and its members
    await prisma.team.delete({
      where: { id: teamId },
    });

    logger.info(`Team deleted: ${existingTeam.name}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error deleting team:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting team');
  }
}

/**
 * Add member to team
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated team
 */
async function addTeamMember(teamId, userId) {
  try {
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          create: {
            user: {
              connect: { id: userId },
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    logger.info(`Member added to team: ${team.name}`);
    return team;
  } catch (error) {
    logger.error('Error adding team member:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding team member');
  }
}

/**
 * Remove member from team
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated team
 */
async function removeTeamMember(teamId, userId) {
  try {
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          deleteMany: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    logger.info(`Member removed from team: ${team.name}`);
    return team;
  } catch (error) {
    logger.error('Error removing team member:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error removing team member');
  }
}

/**
 * Get user by email
 * @param {string} email - User's email
 * @returns {Promise<Object>} User object
 */
async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving user');
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
async function getUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error getting user by ID:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving user');
  }
}

/**
 * Create a new user
 * @param {Object} req - Request object containing user data
 * @returns {Promise<Object>} Created user
 */
async function createUser(req) {
  try {
    const { email, name, password, roleId } = req.body;

    // Validate input
    if (!email || !name || !password || !roleId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, 'User with this email already exists');
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        roleId,
        isActive: true,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`User created: ${user.email}`);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error creating user:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating user');
  }
}

/**
 * Update user
 * @param {Object} req - Request object containing user data
 * @returns {Promise<Object>} Updated user
 */
async function updateUser(req) {
  try {
    const { userId } = req.params;
    const { email, name, password, roleId, isActive } = req.body;

    // Check if user exists
    const existingUser = await getTeamById(userId);
    if (!existingUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // If email is being changed, check for conflicts
    if (email && email !== existingUser.email) {
      const userWithSameEmail = await getUserByEmail(email);
      if (userWithSameEmail) {
        throw new ApiError(httpStatus.CONFLICT, 'User with this email already exists');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        password,
        roleId,
        isActive,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`User updated: ${updatedUser.email}`);
    return updatedUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating user:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating user');
  }
}

/**
 * Get all users with pagination
 * @param {Object} req - Request object containing query parameters
 * @returns {Promise<Object>} Paginated users
 */
async function getUsers(req) {
  try {
    const { page: defaultPage, limit: defaultLimit } = config.pagination;
    const { page = defaultPage, limit = defaultLimit, search } = req.query;

    const offset = getOffset(page, limit);

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' },
        { updatedAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    return {
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting users:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving users');
  }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function deleteUser(userId) {
  try {
    // Check if user exists
    const existingUser = await getTeamById(userId);
    if (!existingUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`User deleted: ${existingUser.email}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error deleting user:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting user');
  }
}

/**
 * Get team by email
 * @param {string} email
 * @returns {Promise<Object>}
 */
const getTeamByEmail = async (email) => {
  try {
    const team = await prisma.team.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
    return team;
  } catch (error) {
    logger.error('Error getting team by email:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting team');
  }
};

/**
 * Update team by id
 * @param {string} teamId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateTeamById = async (teamId, updateBody) => {
  try {
    const team = await getTeamById(teamId);
    
    if (updateBody.email && (await getTeamByEmail(updateBody.email))?.id !== teamId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    if (updateBody.password) {
      updateBody.password = await hashPassword(updateBody.password);
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateBody,
      include: {
        role: true,
      },
    });

    logger.info(`Team updated: ${updatedTeam.email}`);
    return updatedTeam;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating team:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating team');
  }
};

/**
 * Delete team by id
 * @param {string} teamId
 * @returns {Promise<Object>}
 */
const deleteTeamById = async (teamId) => {
  try {
    const team = await getTeamById(teamId);
    
    // Check if team has any members
    const memberCount = await prisma.teamMember.count({
      where: { teamId },
    });

    if (memberCount > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete team with members');
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    logger.info(`Team deleted: ${team.email}`);
    return team;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error deleting team:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting team');
  }
};

/**
 * Query teams
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryTeams = async (filter, options) => {
  try {
    const { sortBy, sortOrder, limit, page } = options;
    const skip = (page - 1) * limit;

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: filter.search || '' } },
          { email: { contains: filter.search || '' } },
        ],
      },
      include: {
        role: true,
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const total = await prisma.team.count({
      where: {
        OR: [
          { name: { contains: filter.search || '' } },
          { email: { contains: filter.search || '' } },
        ],
      },
    });

    return {
      results: teams,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (error) {
    logger.error('Error querying teams:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error querying teams');
  }
};

/**
 * Verify team password
 * @param {string} teamId
 * @param {string} password
 * @returns {Promise<boolean>}
 */
const verifyTeamPassword = async (teamId, password) => {
  try {
    const team = await getTeamById(teamId);
    return comparePassword(password, team.password);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error verifying team password:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error verifying password');
  }
};

module.exports = {
  getTeamById,
  getTeamByName,
  createTeam,
  updateTeam,
  getTeams,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  getUsers,
  deleteUser,
  getTeamByEmail,
  updateTeamById,
  deleteTeamById,
  queryTeams,
  verifyTeamPassword,
}; 