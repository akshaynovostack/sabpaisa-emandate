const httpStatus = require('http-status');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userBody.email },
  });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return prisma.user.create({
    data: userBody,
  });
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      transactions: true,
      user_mandates: true,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Get all users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllUsers = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, search } = options;
  const skip = (page - 1) * limit;

  const where = {
    ...filter,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: 'desc' } : { created_at: 'desc' },
      include: {
        transactions: true,
        user_mandates: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    results: users,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

/**
 * Update user by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (id, updateBody) => {
  const user = await getUserById(id);
  if (updateBody.email && updateBody.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: updateBody.email },
    });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }
  return prisma.user.update({
    where: { id },
    data: updateBody,
  });
};

/**
 * Delete user by id
 * @param {string} id
 * @returns {Promise<User>}
 */
const deleteUserById = async (id) => {
  const user = await getUserById(id);
  
  // Check if user has any transactions or mandates
  if (user.transactions.length > 0 || user.user_mandates.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete user with existing transactions or mandates'
    );
  }

  return prisma.user.delete({
    where: { id },
  });
};

/**
 * Get user statistics for a date range
 */
const getUserStats = async (startDate, endDate) => {
  const total = await prisma.user.count({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  return { total };
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
  getUserStats
}; 