const { PrismaClient } = require('@prisma/client');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const prisma = new PrismaClient();

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Object>}
 */
const createUser = async (userBody) => {
  // Check if user with same email exists
  const existingUser = await prisma.user.findFirst({
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
 * @returns {Promise<Object>}
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
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
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getAllUsers = async (filter, options) => {
  const { page = 1, limit = 10, search } = options;
  const skip = (page - 1) * limit;

  const where = {
    ...filter,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      include: {
        transactions: true,
        user_mandates: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

/**
 * Update user by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateUserById = async (id, updateBody) => {
  const user = await getUserById(id);

  // If email is being updated, check for uniqueness
  if (updateBody.email && updateBody.email !== user.email) {
    const emailExists = await prisma.user.findFirst({
      where: { email: updateBody.email },
    });
    if (emailExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: updateBody,
    include: {
      transactions: true,
      user_mandates: true,
    },
  });

  return updatedUser;
};

/**
 * Delete user by id
 * @param {string} id
 * @returns {Promise<Object>}
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

  await prisma.user.delete({
    where: { id: parseInt(id) },
  });

  return user;
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
}; 