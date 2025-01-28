const express = require("express");

const router = express.Router();

const merchantRoutes = require('./merchantRoutes');
const merchantSlabRoutes = require('./merchantslabRoutes');
const userRoutes = require('./userRoutes');
const transactionRoutes = require('./transactionRoutes');
const userMandateRoutes = require('./usermandateRoutes');
const mandateRoutes = require('./mandateRoutes');


router.use('/merchants', merchantRoutes);
router.use('/merchantslabs', merchantSlabRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/usermandates', userMandateRoutes);
router.use('/mandate', mandateRoutes);
module.exports = router;