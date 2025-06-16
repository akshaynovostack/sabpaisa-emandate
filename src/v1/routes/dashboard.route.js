const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalMandates:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: Total number of mandates in the system
 *             percentageChange:
 *               type: number
 *               format: float
 *               description: Percentage change from last month
 *         activeMandates:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: Number of currently active mandates
 *             percentageChange:
 *               type: number
 *               format: float
 *               description: Percentage change from last month
 *         totalTransactions:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: Total number of transactions processed
 *             percentageChange:
 *               type: number
 *               format: float
 *               description: Percentage change from last month
 *         totalUsers:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: Total number of users in the system
 *             percentageChange:
 *               type: number
 *               format: float
 *               description: Percentage change from last month
 *       example:
 *         totalMandates:
 *           count: 1500
 *           percentageChange: 15.5
 *         activeMandates:
 *           count: 1200
 *           percentageChange: 12.3
 *         totalTransactions:
 *           count: 5000
 *           percentageChange: 8.7
 *         totalUsers:
 *           count: 800
 *           percentageChange: 5.2
 *     
 *     RecentActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the activity
 *         type:
 *           type: string
 *           description: Type of activity (e.g., 'MANDATE_CREATED', 'TRANSACTION_PROCESSED')
 *         description:
 *           type: string
 *           description: Description of the activity
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the activity occurred
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the user
 *             email:
 *               type: string
 *               description: Email of the user
 *             mobile:
 *               type: string
 *               description: Mobile number of the user
 *         merchant:
 *           type: object
 *           properties:
 *             merchant_code:
 *               type: string
 *               description: Merchant code
 *             name:
 *               type: string
 *               description: Merchant name
 *             status:
 *               type: string
 *               description: Merchant status
 *         amount:
 *           type: number
 *           format: float
 *           description: Transaction amount
 *         purpose:
 *           type: string
 *           description: Purpose of the transaction
 *         status:
 *           type: string
 *           description: Status of the activity
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the activity was created
 *       example:
 *         id: "act_123"
 *         type: "TRANSACTION_PROCESSED"
 *         description: "Transaction processed for user John Doe"
 *         timestamp: "2024-03-20T10:30:00Z"
 *         user:
 *           name: "John Doe"
 *           email: "john@example.com"
 *           mobile: "9876543210"
 *         merchant:
 *           merchant_code: "MERCH001"
 *           name: "Example Merchant"
 *           status: "ACTIVE"
 *         amount: 1000.00
 *         purpose: "Monthly payment"
 *         status: "SUCCESS"
 *         created_at: "2024-03-20T10:30:00Z"
 * 
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve key statistics for the dashboard including mandate counts, transaction data, and user metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard statistics
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
 *                   example: "Dashboard statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Insufficient permissions to access dashboard"
 */

router
  .route('/stats')
  .get(
    verifyToken,
    checkPermission('DASHBOARD', { action: 'read', allowOwn: false }),
    dashboardController.getDashboardStats
  );

/**
 * @swagger
 * /api/v1/dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities
 *     description: Retrieve a list of recent activities in the system including mandates and transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 50
 *         description: Number of activities to return (default is 5, max is 50)
 *     responses:
 *       200:
 *         description: Successfully retrieved recent activities
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
 *                   example: "Recent activities retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recentMandates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecentActivity'
 *                       description: List of recent mandates
 *                       example: []
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecentActivity'
 *                       description: List of recent transactions
 *                       example: []
 *       204:
 *         description: No recent activities found
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
 *                   example: "No recent activities found"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recentMandates:
 *                       type: array
 *                       items: []
 *                       example: []
 *                     recentTransactions:
 *                       type: array
 *                       items: []
 *                       example: []
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Insufficient permissions to access dashboard"
 */

router
  .route('/recent-activities')
  .get(
    verifyToken,
    checkPermission('DASHBOARD', { action: 'read', allowOwn: false }),
    dashboardController.getRecentActivities
  );

module.exports = router; 