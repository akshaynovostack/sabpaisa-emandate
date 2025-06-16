const express = require('express');
const validate = require('../../middlewares/validate');
const transactionValidation = require('../validations/transaction.validation');
const transactionController = require('../../v1/controllers/transaction.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');
const { resources } = require('../../config/roles');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the transaction
 *         transaction_id:
 *           type: string
 *           description: External transaction ID
 *         user_id:
 *           type: string
 *           description: ID of the user who initiated the transaction
 *         merchant_id:
 *           type: string
 *           description: ID of the merchant involved
 *         client_transaction_id:
 *           type: string
 *           description: Client's reference transaction ID
 *         sabpaisa_txn_id:
 *           type: string
 *           description: SabPaisa's transaction ID
 *         amount:
 *           type: number
 *           format: float
 *           description: Transaction amount
 *         monthly_emi:
 *           type: number
 *           format: float
 *           description: Monthly EMI amount
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Maximum transaction amount
 *         status:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, CANCELLED]
 *           description: Transaction status
 *         purpose:
 *           type: string
 *           description: Purpose of the transaction
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the transaction was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the transaction was last updated
 *       example:
 *         id: "txn_123"
 *         transaction_id: "TXN123456"
 *         user_id: "user_123"
 *         merchant_id: "merch_123"
 *         client_transaction_id: "CLI123456"
 *         sabpaisa_txn_id: "SAB123456"
 *         amount: "1000.00"
 *         monthly_emi: "100.00"
 *         max_amount: "10000.00"
 *         status: "SUCCESS"
 *         purpose: "Monthly EMI Payment"
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreateTransactionRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - merchant_id
 *         - amount
 *         - purpose
 *       properties:
 *         user_id:
 *           type: string
 *           description: ID of the user initiating the transaction
 *         merchant_id:
 *           type: string
 *           description: ID of the merchant
 *         client_transaction_id:
 *           type: string
 *           description: Client's reference transaction ID
 *         amount:
 *           type: number
 *           format: float
 *           description: Transaction amount
 *         monthly_emi:
 *           type: number
 *           format: float
 *           description: Monthly EMI amount
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Maximum transaction amount
 *         purpose:
 *           type: string
 *           description: Purpose of the transaction
 * 
 *     UpdateTransactionRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, CANCELLED]
 *           description: Updated transaction status
 *         amount:
 *           type: number
 *           format: float
 *           description: Updated transaction amount
 *         monthly_emi:
 *           type: number
 *           format: float
 *           description: Updated monthly EMI amount
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Updated maximum transaction amount
 *         purpose:
 *           type: string
 *           description: Updated purpose of the transaction
 * 
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction with authentication and proper permissions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 * 
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve a list of transactions with filtering and pagination
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for transaction details
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: merchant_id
 *         schema:
 *           type: string
 *         description: Filter by merchant ID
 *       - in: query
 *         name: client_transaction_id
 *         schema:
 *           type: string
 *         description: Filter by client transaction ID
 *       - in: query
 *         name: sabpaisa_txn_id
 *         schema:
 *           type: string
 *         description: Filter by SabPaisa transaction ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, CANCELLED]
 *         description: Filter by transaction status
 *       - in: query
 *         name: date_range
 *         schema:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *             end:
 *               type: string
 *               format: date
 *         description: Filter by date range
 *       - in: query
 *         name: amount_range
 *         schema:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *               format: float
 *             max:
 *               type: number
 *               format: float
 *         description: Filter by amount range
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transactions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 10
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 100
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

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

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   get:
 *     summary: Get a transaction by ID
 *     description: Retrieve a specific transaction by its ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Transaction not found
 * 
 *   patch:
 *     summary: Update a transaction
 *     description: Update a specific transaction by its ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Transaction not found
 * 
 *   delete:
 *     summary: Delete a transaction
 *     description: Delete a specific transaction by its ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         transaction_id:
 *                           type: string
 *                         deleted_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Transaction not found
 */

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