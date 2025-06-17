const express = require('express');

// Import all route files
const authRoute = require('./auth.route');
const teamRoute = require('./team.route');
const roleRoute = require('./role.route');
const rolePermissionRoute = require('./rolePermission.route');
const permissionRoute = require('./permission.route');
const docsRoute = require('./docs.route');
const merchantRoute = require('./merchant.route');
const userRoute = require('./user.route');
const transactionRoute = require('./transaction.route');
const mandateRoute = require('./mandate.routes');
const dashboardRoute = require('./dashboard.route');
const externalRoute = require('./external.route');

const router = express.Router();

// External/Public API Routes (No Authentication Required)
router.use('/external', externalRoute);

// API Routes
router.use('/auth', authRoute);
router.use('/teams', teamRoute);
router.use('/roles', roleRoute);
router.use('/role-permissions', rolePermissionRoute);
router.use('/permissions', permissionRoute);
router.use('/docs', docsRoute);
router.use('/users', userRoute);
router.use('/mandates', mandateRoute);
router.use('/mandate', mandateRoute);
router.use('/transactions', transactionRoute);
router.use('/dashboard', dashboardRoute);

// Business Routes
router.use('/merchants', merchantRoute);

module.exports = router;