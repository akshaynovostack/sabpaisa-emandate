const express = require('express');
const validate = require('../../middlewares/validate');
const teamValidation = require('../validations/team.validation');
const teamController = require('../controllers/team.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');

const router = express.Router();

router
  .route('/')
  .get(
    verifyToken,
    checkPermission('TEAM', { action: 'read', allowOwn: true }),
    validate(teamValidation.getTeams),
    teamController.getTeams
  )
  .post(
    verifyToken,
    checkPermission('TEAM', { action: 'create', allowOwn: false }),
    validate(teamValidation.createTeam),
    teamController.createTeam
  );

router
  .route('/:teamId')
  .get(
    verifyToken,
    checkPermission('TEAM', { action: 'read', allowOwn: true, idParam: 'teamId' }),
    validate(teamValidation.getTeam),
    teamController.getTeam
  )
  .patch(
    verifyToken,
    checkPermission('TEAM', { action: 'update', allowOwn: true, idParam: 'teamId' }),
    validate(teamValidation.updateTeam),
    teamController.updateTeam
  )
  .delete(
    verifyToken,
    checkPermission('TEAM', { action: 'delete', allowOwn: false, idParam: 'teamId' }),
    validate(teamValidation.deleteTeam),
    teamController.deleteTeam
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team management and retrieval
 */

/**
 * @swagger
 * /v1/team:
 *    get:
 *      summary: Get all team members
 *      description: Only admins can retrieve all team members.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *          description: Search by name or email
 *        - in: query
 *          name: mobile
 *          schema:
 *            type: string
 *            pattern: '^[0-9]{10}$'
 *          description: Filter by mobile number
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *          default: 10
 *          description: Maximum number of team members
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
 *                  teams:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Team'
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
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /v1/team/{teamId}:
 *    get:
 *      summary: Get a team member
 *      description: Logged in users can fetch only their own information. Only admins can fetch other team members.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: teamId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Team member id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a team member
 *      description: Logged in users can only update their own information. Only admins can update other team members.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: teamId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Team member id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                  format: email
 *                  description: must be unique
 *                password:
 *                  type: string
 *                  format: password
 *                  description: must be at least 8 characters long
 *                mobile:
 *                  type: string
 *                  pattern: '^[0-9]{10}$'
 *                  description: must be 10 digits
 *                description:
 *                  type: string
 *                  description: optional description of the team member
 *                role_id:
 *                  type: integer
 *                  description: ID of the role assigned to the team member
 *              example:
 *                name: John Doe
 *                email: john@example.com
 *                mobile: "9876543210"
 *                description: "Senior Developer"
 *                role_id: 1
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a team member
 *      description: Logged in users can delete only themselves. Only admins can delete other team members.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: teamId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Team member id
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
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /v1/team:
 *    post:
 *      summary: Create a team member
 *      description: Only users with team management permissions can create team members.
 *      tags: [Team]
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
 *                - email
 *                - password
 *                - mobile
 *                - role_id
 *              properties:
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                  format: email
 *                  description: must be unique
 *                password:
 *                  type: string
 *                  format: password
 *                  description: must be at least 8 characters long
 *                mobile:
 *                  type: string
 *                  pattern: '^[0-9]{10}$'
 *                  description: must be 10 digits
 *                description:
 *                  type: string
 *                  description: optional description of the team member
 *                role_id:
 *                  type: integer
 *                  description: ID of the role assigned to the team member
 *              example:
 *                name: John Doe
 *                email: john@example.com
 *                password: password123
 *                mobile: "9876543210"
 *                description: "Senior Developer"
 *                role_id: 1
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "400":
 *          description: Email already taken, invalid mobile number, or invalid input
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */ 