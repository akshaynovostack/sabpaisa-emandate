const express = require('express');
const validate = require('../../middlewares/validate');
const roleValidation = require('../validations/role.validation');
const roleController = require('../controllers/role.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');
const { resources } = require('../../config/roles');

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the role
 *         name:
 *           type: string
 *           description: Name of the role (must be unique)
 *         description:
 *           type: string
 *           description: Detailed description of the role
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource this permission applies to
 *               actions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [create, read, update, delete]
 *                 description: Allowed actions for this resource
 *               allow_own:
 *                 type: boolean
 *                 description: Whether users can perform actions on their own resources
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the role was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the role was last updated
 *       example:
 *         id: "role_123"
 *         name: "admin"
 *         description: "Administrator role with full access"
 *         permissions:
 *           - resource: "USER"
 *             actions: ["create", "read", "update", "delete"]
 *             allow_own: false
 *           - resource: "MERCHANT"
 *             actions: ["create", "read", "update", "delete"]
 *             allow_own: false
 *         created_at: "2024-03-20T10:30:00Z"
 *         updated_at: "2024-03-20T10:30:00Z"
 * 
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the role (must be unique)
 *         description:
 *           type: string
 *           description: Detailed description of the role
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource this permission applies to
 *               actions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [create, read, update, delete]
 *                 description: Allowed actions for this resource
 *               allow_own:
 *                 type: boolean
 *                 default: false
 *                 description: Whether users can perform actions on their own resources
 *       example:
 *         name: "admin"
 *         description: "Administrator role with full access"
 *         permissions:
 *           - resource: "USER"
 *             actions: ["create", "read", "update", "delete"]
 *             allow_own: false
 * 
 *     UpdateRoleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the role (must be unique)
 *         description:
 *           type: string
 *           description: Updated description of the role
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource this permission applies to
 *               actions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [create, read, update, delete]
 *                 description: Allowed actions for this resource
 *               allow_own:
 *                 type: boolean
 *                 description: Whether users can perform actions on their own resources
 *       example:
 *         name: "admin"
 *         description: "Updated administrator role description"
 *         permissions:
 *           - resource: "USER"
 *             actions: ["create", "read", "update", "delete"]
 *             allow_own: true
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Field that caused the error
 *               message:
 *                 type: string
 *                 description: Error message for the field
 * 
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized - Invalid or missing token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and retrieval endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role with specified permissions. Only users with role management permissions can create roles.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                   example: "Role created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Role with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User does not have role management permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   get:
 *     summary: Get all roles
 *     description: Retrieve a list of all roles with filtering and pagination. Only users with role management permissions can retrieve roles.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of roles per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
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
 *                   example: "Roles retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
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
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User does not have role management permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router
  .route('/')
  .get(
    verifyToken,
    checkPermission('ROLE', { action: 'read', allowOwn: false }),
    validate(roleValidation.getRoles),
    roleController.getRoles
  )
  .post(
    verifyToken,
    checkPermission('ROLE', { action: 'create', allowOwn: false }),
    validate(roleValidation.createRole),
    roleController.createRole
  );

/**
 * @swagger
 * /api/v1/roles/{roleId}:
 *   get:
 *     summary: Get a role by ID
 *     description: Retrieve a specific role by its ID. Only users with role management permissions can fetch roles.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
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
 *                   example: "Role retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User does not have role management permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * 
 *   patch:
 *     summary: Update a role
 *     description: Update a specific role by its ID. Only users with role management permissions can update roles.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   example: "Role updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Role with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User does not have role management permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * 
 *   delete:
 *     summary: Delete a role
 *     description: Delete a specific role by its ID. Only users with role management permissions can delete roles. Cannot delete roles that are assigned to team members.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
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
 *                   example: "Role deleted successfully"
 *       400:
 *         description: Cannot delete role that is assigned to team members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User does not have role management permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/:roleId')
  .get(
    verifyToken,
    checkPermission('ROLE', { action: 'read', allowOwn: false }),
    validate(roleValidation.getRole),
    roleController.getRole
  )
  .patch(
    verifyToken,
    checkPermission('ROLE', { action: 'update', allowOwn: false }),
    validate(roleValidation.updateRole),
    roleController.updateRole
  )
  .delete(
    verifyToken,
    checkPermission('ROLE', { action: 'delete', allowOwn: false }),
    validate(roleValidation.deleteRole),
    roleController.deleteRole
  );

module.exports = router; 