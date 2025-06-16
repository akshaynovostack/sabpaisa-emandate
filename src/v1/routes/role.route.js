const express = require('express');
const validate = require('../../middlewares/validate');
const roleValidation = require('../validations/role.validation');
const roleController = require('../controllers/role.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');
const { resources } = require('../../config/roles');

const router = express.Router();

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

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and retrieval
 */

/**
 * @swagger
 * /v1/roles:
 *    post:
 *      summary: Create a role
 *      description: Only users with role management permissions can create roles.
 *      tags: [Roles]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *              properties:
 *                name:
 *                  type: string
 *                  description: must be unique
 *                description:
 *                  type: string
 *              example:
 *                name: admin
 *                description: Administrator role with full access
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  role:
 *                    $ref: '#/components/schemas/Role'
 *        "400":
 *          description: Role with this name already exists
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          description: User does not have role management permissions
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *
 *    get:
 *      summary: Get all roles
 *      description: Only users with role management permissions can retrieve roles.
 *      tags: [Roles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *          description: Search by name or description
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *          default: 10
 *          description: Maximum number of roles
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Page number
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  roles:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Role'
 *                  pagination:
 *                    type: object
 *                    properties:
 *                      total:
 *                        type: integer
 *                        example: 1
 *                      page:
 *                        type: integer
 *                        example: 1
 *                      limit:
 *                        type: integer
 *                        example: 10
 *                      pages:
 *                        type: integer
 *                        example: 1
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          description: User does not have role management permissions
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /v1/roles/{roleId}:
 *    get:
 *      summary: Get a role
 *      description: Only users with role management permissions can fetch roles.
 *      tags: [Roles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: roleId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Role id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  role:
 *                    $ref: '#/components/schemas/Role'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          description: User does not have role management permissions
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a role
 *      description: Only users with role management permissions can update roles.
 *      tags: [Roles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: roleId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Role id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: must be unique
 *                description:
 *                  type: string
 *              example:
 *                name: admin
 *                description: Updated administrator role description
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  role:
 *                    $ref: '#/components/schemas/Role'
 *        "400":
 *          description: Role with this name already exists
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          description: User does not have role management permissions
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a role
 *      description: Only users with role management permissions can delete roles. Cannot delete roles that are assigned to team members.
 *      tags: [Roles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: roleId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Role id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *        "400":
 *          description: Cannot delete role that is assigned to team members
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          description: User does not have role management permissions
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */ 