const { PrismaClient } = require('@prisma/client');
const { status: httpStatus } = require('http-status');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

/**
 * Convert string amounts to numbers and validate data types
 * @param {Object} transactionBody
 * @returns {Object}
 */
const prepareTransactionData = (transactionBody) => {
  const data = { ...transactionBody };
  
  // Convert string amounts to numbers
  const amountFields = ['monthly_emi', 'max_amount', 'amount'];
  amountFields.forEach(field => {
    if (data[field] !== undefined) {
      data[field] = parseFloat(data[field]);
    }
  });

  // Convert dates to Date objects
  const dateFields = ['start_date', 'end_date'];
  dateFields.forEach(field => {
    if (data[field] !== undefined) {
      data[field] = new Date(data[field]);
    }
  });

  return data;
};

/**
 * Create a transaction
 * @param {Object} transactionBody
 * @returns {Promise<Transaction>}
 */
const createTransaction = async (transactionBody) => {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { user_id: transactionBody.user_id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify merchant exists
  const merchant = await prisma.merchant.findUnique({
    where: { merchant_id: transactionBody.merchant_id },
  });

  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  // Prepare and validate data
  const data = prepareTransactionData(transactionBody);

  // Validate amount ranges
  if (data.amount > data.max_amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Transaction amount cannot be greater than max amount'
    );
  }

  // Generate unique transaction ID
  const transaction_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

  return prisma.transaction.create({
    data: {
      ...data,
      transaction_id,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          user_id: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
      merchant: {
        select: {
          merchant_id: true,
          name: true,
          merchant_code: true,
        },
      },
    },
  });
};

/**
 * Get transaction by id
 * @param {string} id
 * @returns {Promise<Transaction>}
 */
const getTransactionById = async (id) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: {
        select: {
          user_id: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
      merchant: {
        select: {
          merchant_id: true,
          name: true,
          merchant_code: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  return transaction;
};

/**
 * Get all transactions with advanced filtering
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllTransactions = async (filter, options) => {
  const {
    limit = 10,
    page = 1,
    sortBy,
    search,
    user_id,
    merchant_id,
    client_transaction_id,
    sabpaisa_txn_id,
    date_range,
    amount_range,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause with advanced filters
  const where = {
    ...filter,
    ...(user_id && { user_id }),
    ...(merchant_id && { merchant_id }),
    ...(client_transaction_id && { client_transaction_id }),
    ...(sabpaisa_txn_id && { sabpaisa_txn_id }),
    ...(search && {
      OR: [
        { transaction_id: { contains: search } },
        { client_transaction_id: { contains: search } },
        { purpose: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { merchant: { name: { contains: search } } },
      ],
    }),
    ...(date_range && {
      AND: [
        { start_date: { gte: new Date(date_range.start) } },
        { end_date: { lte: new Date(date_range.end) } },
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
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              user_id: true,
              name: true,
              mobile: true,
              email: true,
            },
          },
          merchant: {
            select: {
              merchant_id: true,
              name: true,
              merchant_code: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      results: transactions,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    };
  } catch (error) {
    console.error('Error in getAllTransactions:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching transactions');
  }
};

/**
 * Update transaction by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Transaction>}
 */
const updateTransactionById = async (id, updateBody) => {
  const transaction = await getTransactionById(id);

  // Prepare and validate data
  const data = prepareTransactionData(updateBody);

  // Validate amount ranges if being updated
  if (data.amount !== undefined || data.max_amount !== undefined) {
    const amount = data.amount ?? transaction.amount;
    const maxAmount = data.max_amount ?? transaction.max_amount;
    
    if (amount > maxAmount) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Transaction amount cannot be greater than max amount'
      );
    }
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id: parseInt(id) },
    data,
    include: {
      user: {
        select: {
          user_id: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
      merchant: {
        select: {
          merchant_id: true,
          name: true,
          merchant_code: true,
        },
      },
    },
  });

  return updatedTransaction;
};

/**
 * Delete transaction by id
 * @param {string} id
 * @returns {Promise<Transaction>}
 */
const deleteTransactionById = async (id) => {
  const transaction = await getTransactionById(id);

  // Only allow deletion of pending transactions
  if (transaction.status !== 'PENDING') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only pending transactions can be deleted'
    );
  }

  await prisma.transaction.delete({
    where: { id: parseInt(id) },
  });

  return transaction;
};

/**
 * Get transaction statistics for a date range
 */
const getTransactionStats = async (startDate, endDate) => {
  const total = await prisma.transaction.count({
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
 * Get recent transactions
 */
const getRecentTransactions = async (limit = 5) => {
  const transactions = await prisma.transaction.findMany({
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
      merchant: {
        select: {
          merchant_code: true,
          name: true,
          status: true
        }
      }
    }
  });

  return transactions.map(transaction => ({
    id: transaction.transaction_id,
    user: transaction.user,
    merchant: transaction.merchant,
    amount: transaction.amount,
    purpose: transaction.purpose,
    status: transaction.status,
    created_at: transaction.created_at
  }));
};

module.exports = {
  createTransaction,
  getTransactionById,
  getAllTransactions,
  updateTransactionById,
  deleteTransactionById,
  getTransactionStats,
  getRecentTransactions
}; 