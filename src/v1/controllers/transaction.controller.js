const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { transactionService } = require('../../services');
const { success } = require('../../utils/response');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

/**
 * Create a transaction
 */
const createTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body);
  
  return success(res, {
    message: 'Transaction created successfully',
    data: {
      transaction: {
        ...transaction,
        created_at: new Date(),
        updated_at: new Date(),
      }
    }
  });
});

/**
 * Get all transactions with filters
 */
const getTransactions = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, [
    'sortBy',
    'limit',
    'page',
    'search',
    'user_id',
    'merchant_id',
    'client_transaction_id',
    'sabpaisa_txn_id',
    'status',
    'date_range',
    'amount_range',
  ]);

  // Convert numeric query parameters
  if (options.amount_range) {
    options.amount_range = {
      min: Number(options.amount_range.min),
      max: Number(options.amount_range.max),
    };
  }

  const result = await transactionService.getAllTransactions(filter, options);
  
  return success(res, {
    message: 'Transactions retrieved successfully',
    data: {
      transactions: result.results.map(transaction => ({
        ...transaction,
        // Format numeric fields to 2 decimal places
        monthly_emi: Number(transaction.monthly_emi).toFixed(2),
        max_amount: Number(transaction.max_amount).toFixed(2),
        amount: Number(transaction.amount).toFixed(2),
      })),
      pagination: {
        total: result.totalResults,
        page: Number(result.page),
        limit: Number(result.limit),
        pages: result.totalPages,
      }
    },
    meta: {
      totalCount: result.totalResults,
      currentPage: Number(result.page),
      totalPages: result.totalPages
    }
  });
});

/**
 * Get transaction by id
 */
const getTransaction = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await transactionService.getTransactionById(transactionId);
  
  // Format numeric fields
  const formattedTransaction = {
    ...transaction,
    monthly_emi: Number(transaction.monthly_emi).toFixed(2),
    max_amount: Number(transaction.max_amount).toFixed(2),
    amount: Number(transaction.amount).toFixed(2),
  };

  return success(res, {
    message: 'Transaction retrieved successfully',
    data: {
      transaction: formattedTransaction
    }
  });
});

/**
 * Update transaction
 */
const updateTransaction = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await transactionService.updateTransactionById(transactionId, req.body);
  
  // Format numeric fields
  const formattedTransaction = {
    ...transaction,
    monthly_emi: Number(transaction.monthly_emi).toFixed(2),
    max_amount: Number(transaction.max_amount).toFixed(2),
    amount: Number(transaction.amount).toFixed(2),
  };

  return success(res, {
    message: 'Transaction updated successfully',
    data: {
      transaction: {
        ...formattedTransaction,
        updated_at: new Date(),
      }
    }
  });
});

/**
 * Delete transaction
 */
const deleteTransaction = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await transactionService.deleteTransactionById(transactionId);
  
  return success(res, {
    message: 'Transaction deleted successfully',
    data: {
      transaction: {
        id: transaction.id,
        transaction_id: transaction.transaction_id,
        deleted_at: new Date(),
      }
    }
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
}; 