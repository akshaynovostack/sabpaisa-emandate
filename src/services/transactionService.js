const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../helpers/logger');

const createTransaction = async (data) => {
  return await prisma.transaction.create({ data });
};

const getTransaction = async (id) => {
  return await prisma.transaction.findUnique({ where: { id: parseInt(id) } });
};

const deleteTransaction = async (id) => {
  return await prisma.transaction.delete({ where: { id: parseInt(id) } });
};

const saveTransaction = async (data) => {
  try {
    logger.info('Saving transaction details:', data);

    return await prisma.transaction.create({
      data: {
        transaction_id: data.transaction_id, // Single identifier
        amount: data.amount,
        monthly_emi: data.monthly_emi,
        start_date: data.start_date,
        end_date: data.end_date,
        purpose: data.purpose,
        max_amount: data.max_amount,
        user: {
          connect: {
            user_id: data.user_id,
          },
        },
        merchant: {
          connect: {
            merchant_id: data.merchant_id,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error in saveTransaction:', error);
    throw error;
  }
};
const moment = require('moment');

const updateTransaction = async (data) => {
  const { transaction_id, ...updateFields } = data;

  try {
    logger.info('Updating transaction:', { transaction_id, updateFields });

    // Ensure start_date and end_date are properly formatted
    if (updateFields.start_date) {
      updateFields.start_date = moment(updateFields.start_date).toISOString();
    }
    if (updateFields.end_date) {
      updateFields.end_date = moment(updateFields.end_date).toISOString();
    }

    const transaction = await prisma.transaction.update({
      where: {
        transaction_id: transaction_id,
      },
      data: updateFields,
    });

    logger.info('Transaction updated successfully:', transaction);
    return transaction;
  } catch (error) {
    logger.error('Error updating transaction:', error);
    throw error;
  }
};

const saveOrUpdateTransaction = async (data) => {
  try {
    logger.info('Processing transaction details:', data);

    // Check if the transaction already exists
    const existingTransaction = await prisma.transaction.findFirst({
      where: { transaction_id: data.transaction_id },
    });

    if (existingTransaction) {
      logger.info('Updating existing transaction:', data.transaction_id);
console.log(data)
      // Update the existing transaction
      return await prisma.transaction.update({
        where: { transaction_id: data.transaction_id },
        data: {
          amount: data.amount,
          monthly_emi: data.monthly_emi,
          start_date: data.start_date,
          end_date: data.end_date,
          purpose: data.purpose,
          max_amount: data.max_amount,
          sabpaisa_txn_id: data.sabpaisa_txn_id, // Updated to snake_case
          client_transaction_id: data.client_transaction_id, // Updated to snake_case
          user: {
            connect: {
              user_id: data.user_id,
            },
          },
          merchant: {
            connect: {
              merchant_id: data.merchant_id,
            },
          },
        },
      });
    } else {
      logger.info('Creating a new transaction:', data.transaction_id);

      // Create a new transaction
      return await prisma.transaction.create({
        data: {
          transaction_id: data.transaction_id, // Single identifier
          amount: data.amount,
          monthly_emi: data.monthly_emi,
          start_date: data.start_date,
          end_date: data.end_date,
          purpose: data.purpose,
          max_amount: data.max_amount,
          sabpaisa_txn_id: data.sabpaisa_txn_id, // Updated to snake_case
          user: {
            connect: {
              user_id: data.user_id,
            },
          },
          merchant: {
            connect: {
              merchant_id: data.merchant_id,
            },
          },
        },
      });
    }
  } catch (error) {
    logger.error('Error in saveOrUpdateTransaction:', error);
    throw error;
  }
};
const getLatestTransactionByUserId = async (userId) => {
  try {
    logger.info(`Fetching latest transaction for user ID: ${userId}`);

    const transaction = await prisma.transaction.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc', // Orders by most recent transaction
      },
    });

    if (!transaction) {
      throw new Error(`No transactions found for user ID: ${userId}`);
    }

    logger.info(`Latest transaction for user ID ${userId}:`, transaction);
    return transaction;
  } catch (error) {
    logger.error('Error fetching latest transaction:', error);
    throw error;
  }
};
module.exports = {
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  saveTransaction,
  saveOrUpdateTransaction,
  getLatestTransactionByUserId
};