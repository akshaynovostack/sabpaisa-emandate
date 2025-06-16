const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const permissionValidation = require('../validations/permission.validation');
const permissionController = require('../controllers/permission.controller');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the permission
 *         name:
 *           type: string
 *           description: Name of the permission
 *         description:
 *           type: string
 *           description: Detailed description of the permission
 *         resource:
 *           type: string
 *           description: Resource this permission applies to (e.g., USER, MERCHANT, TRANSACTION)
 *         action:
 *           type: string
 *           enum: [create, read, update, delete]
 *           description: Action allowed by this permission
 *         allow_own:
 *           type: boolean
 *           description: Whether users can perform this action on their own resources
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the permission was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the permission was last updated
 *       example:
 *         id: "perm_123"
 *         name: "Create User"
 *         description: "Allows creating new users in the system"
 *         resource: "USER"
 *         action: "create"
 *         allow_own: false
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreatePermissionRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - resource
 *         - action
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the permission
 *         description:
 *           type: string
 *           description: Detailed description of the permission
 *         resource:
 *           type: string
 *           description: Resource this permission applies to
 *         action:
 *           type: string
 *           enum: [create, read, update, delete]
 *           description: Action allowed by this permission
 *         allow_own:
 *           type: boolean
 *           default: false
 *           description: Whether users can perform this action on their own resources
 * 
 *     UpdatePermissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the permission
 *         description:
 *           type: string
 *           description: Updated description of the permission
 *         resource:
 *           type: string
 *           description: Updated resource this permission applies to
 *         action:
 *           type: string
 *           enum: [create, read, update, delete]
 *           description: Updated action allowed by this permission
 *         allow_own:
 *           type: boolean
 *           description: Updated allow_own setting
 * 
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     summary: Create a new permission
 *     description: Create a new permission with authentication and admin privileges
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermissionRequest'
 *     responses:
 *       201:
 *         description: Permission created successfully
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
 *                   example: "Permission created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 * 
 *   get:
 *     summary: Get all permissions
 *     description: Retrieve a list of all permissions with filtering and pagination
 *     tags: [Permissions]
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
 *         description: Search term for permission details
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, read, update, delete]
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
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
 *                   example: "Permissions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Permission'
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
    checkPermission('PERMISSION', { action: 'create', allowOwn: false }),
    validate(permissionValidation.createPermission),
    permissionController.createPermission
  )
  .get(
    verifyToken,
    checkPermission('PERMISSION', { action: 'read', allowOwn: false }),
    validate(permissionValidation.getPermissions),
    permissionController.getPermissions
  );

/**
 * @swagger
 * /api/v1/permissions/{permissionId}:
 *   get:
 *     summary: Get a permission by ID
 *     description: Retrieve a specific permission by its ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
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
 *                   example: "Permission retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 * 
 *   patch:
 *     summary: Update a permission
 *     description: Update a specific permission by its ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePermissionRequest'
 *     responses:
 *       200:
 *         description: Permission updated successfully
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
 *                   example: "Permission updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 * 
 *   delete:
 *     summary: Delete a permission
 *     description: Delete a specific permission by its ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
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
 *                   example: "Permission deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 */

router
  .route('/:permissionId')
  .get(
    verifyToken,
    checkPermission('PERMISSION', { action: 'read', allowOwn: false }),
    validate(permissionValidation.getPermission),
    permissionController.getPermission
  )
  .patch(
    verifyToken,
    checkPermission('PERMISSION', { action: 'update', allowOwn: false }),
    validate(permissionValidation.updatePermission),
    permissionController.updatePermission
  )
  .delete(
    verifyToken,
    checkPermission('PERMISSION', { action: 'delete', allowOwn: false }),
    validate(permissionValidation.deletePermission),
    permissionController.deletePermission
  );

module.exports = router; 