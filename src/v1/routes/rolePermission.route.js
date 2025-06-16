const express = require('express');
const validate = require('../../middlewares/validate');
const rolePermissionValidation = require('../validations/rolePermission.validation');
const rolePermissionController = require('../controllers/rolePermission.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RolePermissions
 *   description: Role permission management
 */

/**
 * @swagger
 * /v1/role-permissions:
 *   post:
 *     summary: Create a new role permission mapping
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - permission_id
 *             properties:
 *               role_id:
 *                 type: integer
 *                 description: ID of the role
 *               permission_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the permission
 *     responses:
 *       201:
 *         description: Role permission created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Role permission mapping already exists
 */
router
  .route('/')
  .post(
    verifyToken,
    checkPermission('ROLE', { action: 'create', allowOwn: false }),
    validate(rolePermissionValidation.createRolePermission),
    rolePermissionController.createRolePermission
  );

/**
 * @swagger
 * /v1/role-permissions:
 *   get:
 *     summary: Get all role permissions with optional filtering
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         description: Filter by role ID
 *       - in: query
 *         name: permission_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by permission ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of role permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router
  .route('/')
  .get(
    verifyToken,
    checkPermission('ROLE', { action: 'read', allowOwn: false }),
    validate(rolePermissionValidation.getRolePermissions),
    rolePermissionController.getRolePermissions
  );

/**
 * @swagger
 * /v1/role-permissions/{rolePermissionId}:
 *   get:
 *     summary: Get a role permission by ID
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rolePermissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role permission ID
 *     responses:
 *       200:
 *         description: Role permission details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role permission not found
 */
router
  .route('/:rolePermissionId')
  .get(
    verifyToken,
    checkPermission('ROLE', { action: 'read', allowOwn: false }),
    validate(rolePermissionValidation.getRolePermission),
    rolePermissionController.getRolePermission
  );

/**
 * @swagger
 * /v1/role-permissions/{rolePermissionId}:
 *   patch:
 *     summary: Update a role permission
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rolePermissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: integer
 *                 description: New role ID
 *               permission_id:
 *                 type: string
 *                 format: uuid
 *                 description: New permission ID
 *     responses:
 *       200:
 *         description: Role permission updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role permission not found
 *       409:
 *         description: Role permission mapping already exists
 */
router
  .route('/:rolePermissionId')
  .patch(
    verifyToken,
    checkPermission('ROLE', { action: 'update', allowOwn: false }),
    validate(rolePermissionValidation.updateRolePermission),
    rolePermissionController.updateRolePermission
  );

/**
 * @swagger
 * /v1/role-permissions/{rolePermissionId}:
 *   delete:
 *     summary: Delete a role permission
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rolePermissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role permission ID
 *     responses:
 *       200:
 *         description: Role permission deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role permission not found
 */
router
  .route('/:rolePermissionId')
  .delete(
    verifyToken,
    checkPermission('ROLE', { action: 'delete', allowOwn: false }),
    validate(rolePermissionValidation.deleteRolePermission),
    rolePermissionController.deleteRolePermission
  );

module.exports = router; 