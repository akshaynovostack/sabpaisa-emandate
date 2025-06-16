const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');
const merchantValidation = require('../validations/merchant.validation');
const merchantSlabValidation = require('../validations/merchantSlab.validation');
const merchantController = require('../controllers/merchant.controller');
const merchantSlabController = require('../controllers/merchantSlab.controller');

const router = express.Router();

// Merchant routes
router
  .route('/')
  .post(
    verifyToken,
    checkPermission('MERCHANT', { action: 'create', allowOwn: true }),
    validate(merchantValidation.createMerchant),
    merchantController.createMerchant
  )
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantValidation.getMerchants),
    merchantController.getMerchants
  );

router
  .route('/:merchantId')
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantValidation.getMerchant),
    merchantController.getMerchant
  )
  .patch(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantValidation.updateMerchant),
    merchantController.updateMerchant
  )
  .delete(
    verifyToken,
    checkPermission('MERCHANT', { action: 'delete', allowOwn: true }),
    validate(merchantValidation.deleteMerchant),
    merchantController.deleteMerchant
  );

// Merchant Slab routes (nested under merchant)
router
  .route('/:merchantId/slabs')
  .post(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }), // Using MERCHANT permission since slabs are part of merchant management
    validate(merchantSlabValidation.createMerchantSlab),
    merchantSlabController.createMerchantSlab
  )
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlabs),
    merchantSlabController.getMerchantSlabs
  );

router
  .route('/:merchantId/slabs/:slabId')
  .get(
    verifyToken,
    checkPermission('MERCHANT', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlab),
    merchantSlabController.getMerchantSlab
  )
  .patch(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.updateMerchantSlab),
    merchantSlabController.updateMerchantSlab
  )
  .delete(
    verifyToken,
    checkPermission('MERCHANT', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.deleteMerchantSlab),
    merchantSlabController.deleteMerchantSlab
  );

module.exports = router; 