/**
 * Service layer exports
 * This file centralizes all service exports for easier imports
 */

// Authentication and Authorization Services
const authService = require('./auth.service');
const tokenService = require('./token.service');
const roleService = require('./role.service');

// User Management Services
const teamService = require('./team.service');

// Communication Services
const emailService = require('./email.service');

// Permission Services
const permissionService = require('./permission.service');
const userService = require('./user.service');

// Merchant Services
const merchantService = require('./merchant.service');
const merchantSlabService = require('./merchantSlab.service');

// Transaction Services
const transactionService = require('./transaction.service');

// Mandate Services
const mandateService = require('./mandate.service');

// Export all services
module.exports = {
  // Auth & Authorization
  authService,
  tokenService,
  roleService,

  // User Management
  userService,
  teamService,

  // Communication
  emailService,

  // Permission
  permissionService,

  // Merchant
  merchantService,
  merchantSlabService,

  // Transaction
  transactionService,

  // Mandate
  mandateService,
}; 