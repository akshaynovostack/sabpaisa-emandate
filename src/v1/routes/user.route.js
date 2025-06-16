const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');
const userValidation = require('../validations/user.validation');
const userController = require('../controllers/user.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         mobile:
 *           type: string
 *           description: Mobile number of the user
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLOCKED]
 *           description: Current status of the user
 *         role_id:
 *           type: string
 *           description: ID of the role assigned to the user
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *       example:
 *         id: "user_123"
 *         name: "John Doe"
 *         email: "john.doe@example.com"
 *         mobile: "9876543210"
 *         status: "ACTIVE"
 *         role_id: "role_123"
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - mobile
 *         - role_id
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         mobile:
 *           type: string
 *           description: Mobile number of the user
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLOCKED]
 *           default: ACTIVE
 *           description: Initial status of the user
 *         role_id:
 *           type: string
 *           description: ID of the role to assign to the user
 * 
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email address of the user
 *         mobile:
 *           type: string
 *           description: Updated mobile number of the user
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLOCKED]
 *           description: Updated status of the user
 *         role_id:
 *           type: string
 *           description: Updated role ID for the user
 * 
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with authentication and proper permissions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 * 
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of users with filtering and pagination
 *     tags: [Users]
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
 *         description: Search term for user details
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by user name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email address
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *         description: Filter by mobile number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field (e.g., created_at:desc)
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
  .post(
    verifyToken,
    checkPermission('USERINFO', { action: 'create', allowOwn: false }),
    validate(userValidation.createUser),
    userController.createUser
  )
  .get(
    verifyToken,
    checkPermission('USERINFO', { action: 'read', allowOwn: false }),
    validate(userValidation.getUsers),
    userController.getUsers
  );

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a specific user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   example: "User retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 * 
 *   patch:
 *     summary: Update a user
 *     description: Update a specific user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 * 
 *   delete:
 *     summary: Delete a user
 *     description: Delete a specific user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */

router
  .route('/:userId')
  .get(
    verifyToken,
    checkPermission('USERINFO', { action: 'read', allowOwn: false }),
    validate(userValidation.getUser),
    userController.getUser
  )
  .patch(
    verifyToken,
    checkPermission('USERINFO', { action: 'update', allowOwn: false }),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    verifyToken,
    checkPermission('USERINFO', { action: 'delete', allowOwn: false }),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

module.exports = router; 