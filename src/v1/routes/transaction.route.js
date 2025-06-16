const express = require('express');
const validate = require('../../middlewares/validate');
const transactionValidation = require('../validations/transaction.validation');
const transactionController = require('../../v1/controllers/transaction.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');
const { resources } = require('../../config/roles');

const router = express.Router();

router
  .route('/')
  .get(
    verifyToken,
    checkPermission('TRANSACTION', { action: 'read', allowOwn: true }),
    validate(transactionValidation.getTransactions),
    transactionController.getTransactions
  )
  .post(
    verifyToken,
    checkPermission('TRANSACTION', { action: 'create', allowOwn: false }),
    validate(transactionValidation.createTransaction),
    transactionController.createTransaction
  );

router
  .route('/:transactionId')
  .get(
    verifyToken,
    checkPermission('TRANSACTION', { action: 'read', allowOwn: true, idParam: 'transactionId' }),
    validate(transactionValidation.getTransaction),
    transactionController.getTransaction
  )
  .patch(
    verifyToken,
    checkPermission('TRANSACTION', { action: 'update', allowOwn: true, idParam: 'transactionId' }),
    validate(transactionValidation.updateTransaction),
    transactionController.updateTransaction
  )
  .delete(
    verifyToken,
    checkPermission('TRANSACTION', { action: 'delete', allowOwn: false, idParam: 'transactionId' }),
    validate(transactionValidation.deleteTransaction),
    transactionController.deleteTransaction
  );

module.exports = router; 