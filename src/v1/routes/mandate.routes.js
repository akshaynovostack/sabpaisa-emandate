const express = require('express');
const { handleCreateMandate, webHook } = require('../controllers/mandateController');
const mandateController = require('../controllers/mandate.controller');
const validate = require('../../middlewares/validate');
const mandateValidation = require('../validations/mandate.validation');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');

/**
 * @swagger
 * components:
 *   schemas:
 *     Mandate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the mandate
 *         user_id:
 *           type: string
 *           description: ID of the user who owns the mandate
 *         transaction_id:
 *           type: string
 *           description: ID of the associated transaction
 *         registration_status:
 *           type: string
 *           enum: [PENDING, ACTIVE, REJECTED, EXPIRED]
 *           description: Current status of the mandate registration
 *         bank_status_message:
 *           type: string
 *           description: Status message from the bank
 *         bank_account_number:
 *           type: string
 *           description: Bank account number
 *         bank_name:
 *           type: string
 *           description: Name of the bank
 *         bank_ifsc:
 *           type: string
 *           description: IFSC code of the bank
 *         amount:
 *           type: number
 *           format: float
 *           description: Mandate amount
 *         frequency:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, YEARLY]
 *           description: Frequency of the mandate
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of the mandate
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of the mandate
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the mandate was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the mandate was last updated
 *       example:
 *         id: 1
 *         user_id: "user_123"
 *         transaction_id: "txn_456"
 *         registration_status: "ACTIVE"
 *         bank_status_message: "Mandate registered successfully"
 *         bank_account_number: "1234567890"
 *         bank_name: "Example Bank"
 *         bank_ifsc: "EXBK0001234"
 *         amount: 1000.00
 *         frequency: "MONTHLY"
 *         start_date: "2024-03-01"
 *         end_date: "2024-12-31"
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreateMandateRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - transaction_id
 *         - bank_account_number
 *         - bank_name
 *         - bank_ifsc
 *         - amount
 *         - frequency
 *         - start_date
 *         - end_date
 *       properties:
 *         user_id:
 *           type: string
 *           description: ID of the user
 *         transaction_id:
 *           type: string
 *           description: ID of the transaction
 *         bank_account_number:
 *           type: string
 *           description: Bank account number
 *         bank_name:
 *           type: string
 *           description: Name of the bank
 *         bank_ifsc:
 *           type: string
 *           description: IFSC code of the bank
 *         amount:
 *           type: number
 *           format: float
 *           description: Mandate amount
 *         frequency:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, YEARLY]
 *           description: Frequency of the mandate
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of the mandate
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of the mandate
 * 
 *     UpdateMandateRequest:
 *       type: object
 *       properties:
 *         registration_status:
 *           type: string
 *           enum: [PENDING, ACTIVE, REJECTED, EXPIRED]
 *           description: New status of the mandate
 *         bank_status_message:
 *           type: string
 *           description: New status message from the bank
 *         amount:
 *           type: number
 *           format: float
 *           description: Updated mandate amount
 *         frequency:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, YEARLY]
 *           description: Updated frequency of the mandate
 *         end_date:
 *           type: string
 *           format: date
 *           description: Updated end date of the mandate
 * 
 * @swagger
 * tags:
 *   name: Mandates
 *   description: Mandate management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/mandates/create:
 *   get:
 *     summary: Create a mandate (Legacy)
 *     description: Legacy endpoint to create a mandate without authentication
 *     tags: [Mandates]
 *     parameters:
 *       - in: query
 *         name: consumer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Consumer ID
 *       - in: query
 *         name: customer_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer name
 *       - in: query
 *         name: customer_mobile
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer mobile number
 *       - in: query
 *         name: customer_email_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer email
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: max_amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Maximum amount
 *       - in: query
 *         name: frequency
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, YEARLY]
 *         description: Frequency
 *       - in: query
 *         name: purpose
 *         required: true
 *         schema:
 *           type: string
 *         description: Purpose
 *       - in: query
 *         name: mandate_category
 *         required: true
 *         schema:
 *           type: string
 *         description: Mandate category
 *       - in: query
 *         name: client_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Client code
 *     responses:
 *       200:
 *         description: Mandate created successfully
 *       400:
 *         description: Invalid input parameters
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a mandate (Legacy POST)
 *     description: Legacy endpoint to create a mandate without authentication using POST method
 *     tags: [Mandates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consumer_id
 *               - customer_name
 *               - customer_mobile
 *               - customer_email_id
 *               - start_date
 *               - end_date
 *               - max_amount
 *               - frequency
 *               - purpose
 *               - mandate_category
 *               - client_code
 *             properties:
 *               consumer_id:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               customer_mobile:
 *                 type: string
 *               customer_email_id:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               max_amount:
 *                 type: number
 *               frequency:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, YEARLY]
 *               purpose:
 *                 type: string
 *               mandate_category:
 *                 type: string
 *               client_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mandate created successfully
 *       400:
 *         description: Invalid input parameters
 *       500:
 *         description: Server error
 */

router.get('/create', handleCreateMandate);
router.post('/create', handleCreateMandate);

/**
 * @swagger
 * /api/v1/mandates/web-hook/{id}:
 *   get:
 *     summary: Webhook endpoint for mandate status updates
 *     description: Endpoint for receiving mandate status updates from the bank
 *     tags: [Mandates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mandate ID
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid mandate ID
 *       500:
 *         description: Server error
 */

router.get('/web-hook/:id', webHook);

/**
 * @swagger
 * /api/v1/mandates:
 *   post:
 *     summary: Create a new mandate
 *     description: Create a new mandate with authentication and permissions
 *     tags: [Mandates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMandateRequest'
 *     responses:
 *       201:
 *         description: Mandate created successfully
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
 *                   example: "Mandate created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Mandate'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 * 
 *   get:
 *     summary: Get all mandates
 *     description: Retrieve a list of mandates with filtering and pagination
 *     tags: [Mandates]
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
 *         description: Search term for mandate details
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: registration_status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, REJECTED, EXPIRED]
 *         description: Filter by registration status
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
 *     responses:
 *       200:
 *         description: List of mandates retrieved successfully
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
 *                   example: "Mandates retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mandates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Mandate'
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

router
  .route('/')
  .post(
    verifyToken,
    checkPermission('MANDATE', { action: 'create', allowOwn: false }),
    validate(mandateValidation.createMandate),
    mandateController.createMandate
  )
  .get(
    verifyToken,
    checkPermission('MANDATE', { action: 'read', allowOwn: true }),
    validate(mandateValidation.getMandates),
    mandateController.getMandates
  );

/**
 * @swagger
 * /api/v1/mandates/{mandateId}:
 *   get:
 *     summary: Get a mandate by ID
 *     description: Retrieve a specific mandate by its ID
 *     tags: [Mandates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mandateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mandate ID
 *     responses:
 *       200:
 *         description: Mandate retrieved successfully
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
 *                   example: "Mandate retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Mandate'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Mandate not found
 * 
 *   patch:
 *     summary: Update a mandate
 *     description: Update a specific mandate by its ID
 *     tags: [Mandates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mandateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mandate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMandateRequest'
 *     responses:
 *       200:
 *         description: Mandate updated successfully
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
 *                   example: "Mandate updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Mandate'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Mandate not found
 * 
 *   delete:
 *     summary: Delete a mandate
 *     description: Delete a specific mandate by its ID
 *     tags: [Mandates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mandateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mandate ID
 *     responses:
 *       200:
 *         description: Mandate deleted successfully
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
 *                   example: "Mandate deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Mandate not found
 */

router
  .route('/:mandateId')
  .get(
    verifyToken,
    checkPermission('MANDATE', { action: 'read', allowOwn: true }),
    validate(mandateValidation.getMandate),
    mandateController.getMandate
  )
  .patch(
    verifyToken,
    checkPermission('MANDATE', { action: 'update', allowOwn: false }),
    validate(mandateValidation.updateMandate),
    mandateController.updateMandate
  )
  .delete(
    verifyToken,
    checkPermission('MANDATE', { action: 'delete', allowOwn: false }),
    validate(mandateValidation.deleteMandate),
    mandateController.deleteMandate
  );

module.exports = router;