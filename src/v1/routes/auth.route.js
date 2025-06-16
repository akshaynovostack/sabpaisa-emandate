const express = require('express');
const validate = require('../../middlewares/validate');
const { authLimiter } = require('../../middlewares/rateLimiter');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../../middlewares/auth');
const { resources } = require('../../config/roles');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');

const router = express.Router();

router.post(
  '/register',
  validate(authValidation.register),
  authController.register
);
router.post('/login', validate(authValidation.login), authController.login);
router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
  authController.resetPassword
);

// Add refresh token endpoint
router.post(
  '/refresh-token',
  validate(authValidation.refreshToken),
  authController.refreshTokens
);

// Add logout endpoint - requires authentication
router.post(
  '/logout', 
  verifyToken,
  checkPermission('TEAM', { action: 'update', allowOwn: true }),
  authController.logout
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /v1/auth/register:
 *    post:
 *      summary: Register a new team member
 *      tags: [Auth]
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
 *                - role_id
 *              properties:
 *                name:
 *                  type: string
 *                  description: Full name of the team member
 *                email:
 *                  type: string
 *                  format: email
 *                  description: must be unique
 *                password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *                role_id:
 *                  type: integer
 *                  description: ID of the role assigned to the team member
 *              example:
 *                name: John Doe
 *                email: john@example.com
 *                password: Password123
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
 *                  tokens:
 *                    $ref: '#/components/schemas/AuthTokens'
 *        "400":
 *          description: Email already registered
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /v1/auth/login:
 *    post:
 *      summary: Login with email and password
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - password
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                password:
 *                  type: string
 *                  format: password
 *              example:
 *                email: john@example.com
 *                password: Password123
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
 *                  tokens:
 *                    $ref: '#/components/schemas/AuthTokens'
 *        "401":
 *          description: Invalid email or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /v1/auth/forgot-password:
 *    post:
 *      summary: Request password reset
 *      description: An email will be sent to reset password.
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *              example:
 *                email: john@example.com
 *      responses:
 *        "200":
 *          description: Password reset email sent
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *        "404":
 *          description: No team member found with this email
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /v1/auth/reset-password:
 *    post:
 *      summary: Reset password
 *      tags: [Auth]
 *      parameters:
 *        - in: query
 *          name: token
 *          required: true
 *          schema:
 *            type: string
 *          description: The reset password token
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *              properties:
 *                password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *              example:
 *                password: NewPassword123
 *      responses:
 *        "200":
 *          description: Password reset successful
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *        "401":
 *          description: Password reset failed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /v1/auth/refresh-token:
 *    post:
 *      summary: Refresh access token
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - refreshToken
 *              properties:
 *                refreshToken:
 *                  type: string
 *                  description: The refresh token issued during login
 *              example:
 *                refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *      responses:
 *        "200":
 *          description: Tokens refreshed successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *                  tokens:
 *                    $ref: '#/components/schemas/AuthTokens'
 *        "401":
 *          description: Invalid refresh token
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /v1/auth/logout:
 *    post:
 *      summary: Logout from the application
 *      tags: [Auth]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: Logged out successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *        "401":
 *          description: Not authenticated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role_id:
 *           type: integer
 *           example: 1
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         created_date_time:
 *           type: string
 *           format: date-time
 *         modified_date_time:
 *           type: string
 *           format: date-time
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Admin
 *         description:
 *           type: string
 *           example: Administrator role with full access
 *     AuthTokens:
 *       type: object
 *       properties:
 *         access:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             expires:
 *               type: string
 *               format: date-time
 *         refresh:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             expires:
 *               type: string
 *               format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: Invalid input
 */ 