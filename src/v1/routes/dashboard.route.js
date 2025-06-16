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
 *           type: integer
 *           description: Total number of mandates in the system
 *         activeMandates:
 *           type: integer
 *           description: Number of currently active mandates
 *         totalTransactions:
 *           type: integer
 *           description: Total number of transactions processed
 *         totalUsers:
 *           type: integer
 *           description: Total number of users in the system
 *         successRate:
 *           type: number
 *           format: float
 *           description: Success rate of transactions (percentage)
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: Total transaction amount processed
 *       example:
 *         totalMandates: 1500
 *         activeMandates: 1200
 *         totalTransactions: 5000
 *         totalUsers: 800
 *         successRate: 98.5
 *         totalAmount: 1500000.00
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
 *         userId:
 *           type: string
 *           description: ID of the user who performed the activity
 *         userName:
 *           type: string
 *           description: Name of the user who performed the activity
 *       example:
 *         id: "act_123"
 *         type: "MANDATE_CREATED"
 *         description: "New mandate created for user John Doe"
 *         timestamp: "2024-03-20T10:30:00Z"
 *         userId: "user_456"
 *         userName: "John Doe"
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
 *     description: Retrieve a list of recent activities in the system
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecentActivity'
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