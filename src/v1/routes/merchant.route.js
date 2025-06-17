const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');
const merchantValidation = require('../validations/merchant.validation');
const merchantSlabValidation = require('../validations/merchantSlab.validation');
const merchantController = require('../controllers/merchant.controller');
const merchantSlabController = require('../controllers/merchantSlab.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Merchant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the merchant
 *         name:
 *           type: string
 *           description: Name of the merchant
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the merchant
 *         phone:
 *           type: string
 *           description: Phone number of the merchant
 *         address:
 *           type: string
 *           description: Physical address of the merchant
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *           description: Current status of the merchant
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the merchant was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the merchant was last updated
 *       example:
 *         id: "merch_123"
 *         name: "Example Merchant"
 *         email: "merchant@example.com"
 *         phone: "+919876543210"
 *         address: "123 Merchant Street, Business City"
 *         status: "ACTIVE"
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreateMerchantRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the merchant
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the merchant
 *         phone:
 *           type: string
 *           description: Phone number of the merchant
 *         address:
 *           type: string
 *           description: Physical address of the merchant
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *           default: ACTIVE
 *           description: Initial status of the merchant
 * 
 *     UpdateMerchantRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the merchant
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email address
 *         phone:
 *           type: string
 *           description: Updated phone number
 *         address:
 *           type: string
 *           description: Updated physical address
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *           description: Updated status of the merchant
 * 
 *     MerchantSlab:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the slab
 *         merchant_id:
 *           type: string
 *           description: ID of the associated merchant
 *         min_amount:
 *           type: number
 *           format: float
 *           description: Minimum amount for this slab
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Maximum amount for this slab
 *         fee_type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *           description: Type of fee calculation
 *         fee_value:
 *           type: number
 *           format: float
 *           description: Fee value (percentage or fixed amount)
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: Status of the slab
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the slab was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the slab was last updated
 *       example:
 *         id: "slab_123"
 *         merchant_id: "merch_123"
 *         min_amount: 1000.00
 *         max_amount: 5000.00
 *         fee_type: "PERCENTAGE"
 *         fee_value: 2.5
 *         status: "ACTIVE"
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreateMerchantSlabRequest:
 *       type: object
 *       required:
 *         - min_amount
 *         - max_amount
 *         - fee_type
 *         - fee_value
 *       properties:
 *         min_amount:
 *           type: number
 *           format: float
 *           description: Minimum amount for this slab
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Maximum amount for this slab
 *         fee_type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *           description: Type of fee calculation
 *         fee_value:
 *           type: number
 *           format: float
 *           description: Fee value (percentage or fixed amount)
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           default: ACTIVE
 *           description: Initial status of the slab
 * 
 *     UpdateMerchantSlabRequest:
 *       type: object
 *       properties:
 *         min_amount:
 *           type: number
 *           format: float
 *           description: Updated minimum amount
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Updated maximum amount
 *         fee_type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *           description: Updated fee type
 *         fee_value:
 *           type: number
 *           format: float
 *           description: Updated fee value
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: Updated status of the slab
 * 
 * @swagger
 * tags:
 *   name: Merchants
 *   description: Merchant and merchant slab management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /v1/merchants:
 *   post:
 *     summary: Create a new merchant
 *     description: Create a new merchant with authentication and permissions
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMerchantRequest'
 *     responses:
 *       201:
 *         description: Merchant created successfully
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
 *                   example: "Merchant created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Merchant'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 * 
 *   get:
 *     summary: Get all merchants
 *     description: Retrieve a list of merchants with filtering and pagination
 *     tags: [Merchants]
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
 *         description: Search term for merchant details
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by merchant status
 *     responses:
 *       200:
 *         description: List of merchants retrieved successfully
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
 *                   example: "Merchants retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Merchant'
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
    checkPermission('MERCHANT', { action: 'create', allowOwn: true }),
    validate(merchantValidation.createMerchant),
    merchantController.createMerchant
  )
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantValidation.getMerchants),
    merchantController.getMerchants
  );

/**
 * @swagger
 * /v1/merchants/{merchantId}:
 *   get:
 *     summary: Get a merchant by ID
 *     description: Retrieve a specific merchant by their ID
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     responses:
 *       200:
 *         description: Merchant retrieved successfully
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
 *                   example: "Merchant retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Merchant'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant not found
 * 
 *   patch:
 *     summary: Update a merchant
 *     description: Update a specific merchant by their ID
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMerchantRequest'
 *     responses:
 *       200:
 *         description: Merchant updated successfully
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
 *                   example: "Merchant updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Merchant'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant not found
 * 
 *   delete:
 *     summary: Delete a merchant
 *     description: Delete a specific merchant by their ID
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     responses:
 *       200:
 *         description: Merchant deleted successfully
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
 *                   example: "Merchant deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant not found
 */

router
  .route('/:merchantId')
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantValidation.getMerchant),
    merchantController.getMerchant
  )
  .patch(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantValidation.updateMerchant),
    merchantController.updateMerchant
  )
  .delete(
    verifyToken,
    checkPermission('MERCHANT', { action: 'delete', allowOwn: true }),
    validate(merchantValidation.deleteMerchant),
    merchantController.deleteMerchant
  );

/**
 * @swagger
 * /v1/merchants/{merchantId}/slabs:
 *   post:
 *     summary: Create a new merchant slab
 *     description: Create a new fee slab for a specific merchant
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMerchantSlabRequest'
 *     responses:
 *       201:
 *         description: Merchant slab created successfully
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
 *                   example: "Merchant slab created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MerchantSlab'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant not found
 * 
 *   get:
 *     summary: Get all merchant slabs
 *     description: Retrieve all fee slabs for a specific merchant
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by slab status
 *     responses:
 *       200:
 *         description: List of merchant slabs retrieved successfully
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
 *                   example: "Merchant slabs retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MerchantSlab'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant not found
 */

router
  .route('/:merchantId/slabs')
  .post(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.createMerchantSlab),
    merchantSlabController.createMerchantSlab
  )
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlabs),
    merchantSlabController.getMerchantSlabs
  );

/**
 * @swagger
 * /v1/merchants/{merchantId}/slabs/{slabId}:
 *   get:
 *     summary: Get a merchant slab by ID
 *     description: Retrieve a specific fee slab for a merchant
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *       - in: path
 *         name: slabId
 *         required: true
 *         schema:
 *           type: string
 *         description: Slab ID
 *     responses:
 *       200:
 *         description: Merchant slab retrieved successfully
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
 *                   example: "Merchant slab retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MerchantSlab'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant or slab not found
 * 
 *   patch:
 *     summary: Update a merchant slab
 *     description: Update a specific fee slab for a merchant
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *       - in: path
 *         name: slabId
 *         required: true
 *         schema:
 *           type: string
 *         description: Slab ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMerchantSlabRequest'
 *     responses:
 *       200:
 *         description: Merchant slab updated successfully
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
 *                   example: "Merchant slab updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MerchantSlab'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant or slab not found
 * 
 *   delete:
 *     summary: Delete a merchant slab
 *     description: Delete a specific fee slab for a merchant
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *       - in: path
 *         name: slabId
 *         required: true
 *         schema:
 *           type: string
 *         description: Slab ID
 *     responses:
 *       200:
 *         description: Merchant slab deleted successfully
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
 *                   example: "Merchant slab deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Merchant or slab not found
 */

router
  .route('/:merchantId/slabs/:slabId')
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlab),
    merchantSlabController.getMerchantSlab
  )
  .patch(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.updateMerchantSlab),
    merchantSlabController.updateMerchantSlab
  )
  .delete(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.deleteMerchantSlab),
    merchantSlabController.deleteMerchantSlab
  );

module.exports = router; 