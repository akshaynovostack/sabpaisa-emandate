const { PrismaClient } = require('@prisma/client');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const prisma = new PrismaClient();

/**
 * Create a mandate
 * @param {Object} mandateData
 * @returns {Promise<Object>}
 */
const createMandate = async (mandateData) => {
  try {
    const { transaction_id, user_id, ...data } = mandateData;

    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { transaction_id },
    });
    if (!transaction) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { user_id },
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Create mandate
    const mandate = await prisma.user_mandate.create({
      data: {
        transaction: { connect: { transaction_id } },
        user: { connect: { user_id } },
        ...data,
        due_date: data.due_date ? new Date(data.due_date) : null,
        paid_date: data.paid_date ? new Date(data.paid_date) : null,
      },
      include: {
        transaction: true,
        user: true,
      },
    });

    logger.info('Mandate created successfully', { mandateId: mandate.id });
    return mandate;
  } catch (error) {
    logger.error('Error creating mandate:', error);
    throw error;
  }
};

/**
 * Get mandate by id
 * @param {string} mandateId
 * @returns {Promise<Object>}
 */
const getMandateById = async (mandateId) => {
  const mandate = await prisma.user_mandate.findUnique({
    where: { id: parseInt(mandateId) },
    include: {
      transaction: true,
      user: true,
    },
  });
  if (!mandate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mandate not found');
  }
  return mandate;
};

/**
 * Get all mandates with filtering and pagination
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getAllMandates = async (filter, options) => {
  const {
    limit = 10,
    page = 1,
    sortBy,
    search,
    user_id,
    transaction_id,
    registration_status,
    bank_status_message,
    date_range,
    amount_range,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause with advanced filters
  const where = {
    ...filter,
    ...(user_id && { user_id }),
    ...(transaction_id && { transaction_id }),
    ...(registration_status && { registration_status }),
    ...(bank_status_message && { bank_status_message }),
    ...(search && {
      OR: [
        { bank_account_number: { contains: search } },
        { bank_name: { contains: search } },
        { bank_ifsc: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { transaction: { transaction_id: { contains: search } } },
      ],
    }),
    ...(date_range && {
      AND: [
        { due_date: { gte: new Date(date_range.start) } },
        { due_date: { lte: new Date(date_range.end) } },
      ],
    }),
    ...(amount_range && {
      AND: [
        { amount: { gte: parseFloat(amount_range.min) } },
        { amount: { lte: parseFloat(amount_range.max) } },
      ],
    }),
  };

  // Build orderBy clause
  const orderBy = sortBy
    ? {
        [sortBy.split(':')[0]]: sortBy.split(':')[1] || 'desc',
      }
    : { created_at: 'desc' };

  try {
    const [mandates, total] = await Promise.all([
      prisma.user_mandate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          transaction: true,
          user: {
            select: {
              user_id: true,
              name: true,
              mobile: true,
              email: true,
            },
          },
        },
      }),
      prisma.user_mandate.count({ where }),
    ]);

    return {
      results: mandates,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    };
  } catch (error) {
    logger.error('Error fetching mandates:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching mandates');
  }
};

/**
 * Update mandate by id
 * @param {string} mandateId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateMandateById = async (mandateId, updateBody) => {
  const mandate = await getMandateById(mandateId);

  // Update mandate
  const updatedMandate = await prisma.user_mandate.update({
    where: { id: parseInt(mandateId) },
    data: {
      ...updateBody,
      due_date: updateBody.due_date ? new Date(updateBody.due_date) : undefined,
      paid_date: updateBody.paid_date ? new Date(updateBody.paid_date) : undefined,
    },
    include: {
      transaction: true,
      user: true,
    },
  });

  logger.info('Mandate updated successfully', { mandateId: updatedMandate.id });
  return updatedMandate;
};

/**
 * Delete mandate by id
 * @param {string} mandateId
 * @returns {Promise<Object>}
 */
const deleteMandateById = async (mandateId) => {
  const mandate = await getMandateById(mandateId);

  // Check if mandate can be deleted (e.g., not in active state)
  if (mandate.registration_status === 'ACTIVE') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete an active mandate'
    );
  }

  await prisma.user_mandate.delete({
    where: { id: parseInt(mandateId) },
  });

  logger.info('Mandate deleted successfully', { mandateId: mandate.id });
  return mandate;
};

/**
 * Get mandate statistics for a date range
 */
const getMandateStats = async (startDate, endDate) => {
  const total = await prisma.user_mandate.count({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  return { total };
};

/**
 * Get active mandate statistics for a date range
 */
const getActiveMandateStats = async (startDate, endDate) => {
  const total = await prisma.user_mandate.count({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate
      },
      registration_status: 'ACTIVE'
    }
  });
  return { total };
};

/**
 * Get recent mandates
 */
const getRecentMandates = async (limit = 5) => {
  const mandates = await prisma.user_mandate.findMany({
    take: limit,
    orderBy: {
      created_at: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          mobile: true
        }
      },
      transaction: {
        select: {
          amount: true,
          purpose: true
        }
      }
    }
  });

  return mandates.map(mandate => ({
    id: mandate.id,
    user: mandate.user,
    amount: mandate.transaction?.amount,
    purpose: mandate.transaction?.purpose,
    registration_status: mandate.registration_status,
    bank_status_message: mandate.bank_status_message,
    created_at: mandate.created_at
  }));
};

module.exports = {
  createMandate,
  getMandateById,
  getAllMandates,
  updateMandateById,
  deleteMandateById,
  getMandateStats,
  getActiveMandateStats,
  getRecentMandates
}; 