const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const validate = require('../../middlewares/validate');
const merchantSlabValidation = require('../validations/merchantSlab.validation');
const verifyToken = require('../../middlewares/verifyToken');
const merchantSlabController = require('../controllers/merchantSlab.controller');

/**
 * @swagger
 * components:
 *   schemas:
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
 *   name: Merchant Slabs
 *   description: Merchant fee slab management endpoints
 */

const router = express.Router({ mergeParams: true }); // Enable access to parent route params

/**
 * @swagger
 * /api/v1/merchants/{merchantId}/slabs:
 *   post:
 *     summary: Create a new merchant slab
 *     description: Create a new fee slab for a specific merchant
 *     tags: [Merchant Slabs]
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
 *     tags: [Merchant Slabs]
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
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *           format: float
 *         description: Filter by minimum amount
 *       - in: query
 *         name: max_amount
 *         schema:
 *           type: number
 *           format: float
 *         description: Filter by maximum amount
 *       - in: query
 *         name: fee_type
 *         schema:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *         description: Filter by fee type
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
  .route('/')
  .post(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'create', allowOwn: true }),
    validate(merchantSlabValidation.createMerchantSlab),
    merchantSlabController.createMerchantSlab
  )
  .get(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlabs),
    merchantSlabController.getMerchantSlabs
  );

/**
 * @swagger
 * /api/v1/merchants/{merchantId}/slabs/{slabId}:
 *   get:
 *     summary: Get a merchant slab by ID
 *     description: Retrieve a specific fee slab for a merchant
 *     tags: [Merchant Slabs]
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
 *     tags: [Merchant Slabs]
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
 *       400:
 *         description: Invalid input parameters
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
 *     tags: [Merchant Slabs]
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
  .route('/:slabId')
  .get(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlab),
    merchantSlabController.getMerchantSlab
  )
  .patch(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.updateMerchantSlab),
    merchantSlabController.updateMerchantSlab
  )
  .delete(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'delete', allowOwn: true }),
    validate(merchantSlabValidation.deleteMerchantSlab),
    merchantSlabController.deleteMerchantSlab
  );

module.exports = router; 