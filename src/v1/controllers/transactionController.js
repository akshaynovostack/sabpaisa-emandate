const transactionService = require('../../services/transactionService');
const logger = require('../../helpers/logger');

const createTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    logger.info('Transaction created successfully', { id: transaction.id });
    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Error creating Transaction', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.getTransaction(req.params.id);
    if (!transaction) {
      logger.warn('Transaction not found', { id: req.params.id });
      return res.status(404).json({ message: 'Transaction not found' });
    }
    logger.info('Transaction retrieved successfully', { id: req.params.id });
    res.json(transaction);
  } catch (error) {
    logger.error('Error retrieving Transaction', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.body);
    logger.info('Transaction updated successfully', { id: req.params.id });
    res.json(transaction);
  } catch (error) {
    logger.error('Error updating Transaction', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    await transactionService.deleteTransaction(req.params.id);
    logger.info('Transaction deleted successfully', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting Transaction', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};