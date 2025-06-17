const express = require('express');
const merchantController = require('../controllers/merchant.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     MandateCalculationRequest:
 *       type: object
 *       required:
 *         - merchant_id
 *         - payment_amount
 *       properties:
 *         merchant_id:
 *           type: string
 *           description: Merchant ID for calculation
 *           example: "MERCH001"
 *         payment_amount:
 *           type: number
 *           format: float
 *           description: Total amount to be taken from client
 *           example: 5000.00
 * 
 *     MandateCalculationResponse:
 *       type: object
 *       properties:
 *         merchant_id:
 *           type: string
 *           description: Merchant ID
 *           example: "MERCH001"
 *         merchant_name:
 *           type: string
 *           description: Merchant name
 *           example: "Example Merchant"
 *         payment_amount:
 *           type: number
 *           format: float
 *           description: Payment amount
 *           example: 5000.00
 *         start_date:
 *           type: string
 *           format: date
 *           description: Mandate start date
 *           example: "2024-03-21"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Mandate end date
 *           example: "2025-03-21"
 *         total_emis:
 *           type: integer
 *           description: Total number of EMIs (same as EMI tenure)
 *           example: 12
 *         convenience_fee:
 *           type: number
 *           format: float
 *           description: Processing fee amount
 *           example: 100.00
 *         emi_amount:
 *           type: number
 *           format: float
 *           description: EMI amount per payment
 *           example: 416.67
 *         downpayment:
 *           type: number
 *           format: float
 *           description: Downpayment amount (Base Amount)
 *           example: 500.00
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Total amount (same as payment_amount from request)
 *           example: 5000.00
 *         total_emi_amount:
 *           type: number
 *           format: float
 *           description: Total EMI amount
 *           example: 5000.00
 *         total_payable:
 *           type: number
 *           format: float
 *           description: Total payable amount
 *           example: 5600.00
 *         frequency:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Frequency code
 *               example: "MNTH"
 *             description:
 *               type: string
 *               description: Frequency description
 *               example: "Monthly"
 *             id:
 *               type: integer
 *               description: Frequency ID
 *               example: 4
 *         duration:
 *           type: integer
 *           description: Duration in months
 *           example: 12
 *         calculation_details:
 *           type: object
 *           properties:
 *             slab_from:
 *               type: number
 *               format: float
 *               description: Slab minimum amount
 *               example: 1000.00
 *             slab_to:
 *               type: number
 *               format: float
 *               description: Slab maximum amount
 *               example: 10000.00
 *             base_amount:
 *               type: number
 *               format: float
 *               description: Base amount (Downpayment)
 *               example: 500.00
 *             emi_tenure:
 *               type: integer
 *               description: EMI tenure in months
 *               example: 12
 *             frequency_multiplier:
 *               type: integer
 *               description: Frequency multiplier (not used in current calculation)
 *               example: 1
 *             processing_fee_percentage:
 *               type: number
 *               format: float
 *               description: Processing fee percentage
 *               example: 2.5
 *             mandate_category:
 *               type: string
 *               description: Mandate category
 *               example: "A001"
 * 
 * @swagger
 * tags:
 *   name: External APIs
 *   description: Public external API endpoints that don't require authentication
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/external/calculate-mandate:
 *   get:
 *     summary: Calculate mandate details
 *     description: Calculate mandate details based on merchant ID and payment amount without authentication
 *     tags: [External APIs]
 *     parameters:
 *       - in: query
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: "MERCH001"
 *       - in: query
 *         name: payment_amount
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Payment amount for mandate calculation
 *         example: 5000.00
 *     responses:
 *       200:
 *         description: Mandate details calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Mandate details calculated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MandateCalculationResponse'
 *       400:
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Merchant ID and payment amount are required"
 *       404:
 *         description: Merchant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Merchant not found"
 */

router.get('/calculate-mandate', merchantController.calculateMandateDetails);

module.exports = router; 