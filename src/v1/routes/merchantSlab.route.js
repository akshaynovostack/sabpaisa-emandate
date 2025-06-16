const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const validate = require('../../middlewares/validate');
const merchantSlabValidation = require('../validations/merchantSlab.validation');
const verifyToken = require('../../middlewares/verifyToken');
const merchantSlabController = require('../controllers/merchantSlab.controller');

const router = express.Router({ mergeParams: true }); // Enable access to parent route params

// All routes are now relative to /merchants/:merchantId/slabs
router
  .route('/')
  .post(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'create', allowOwn: true }),
    validate(merchantSlabValidation.createMerchantSlab),
    merchantSlabController.createMerchantSlab
  )
  .get(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlabs),
    merchantSlabController.getMerchantSlabs
  );

router
  .route('/:slabId')
  .get(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'read', allowOwn: true }),
    validate(merchantSlabValidation.getMerchantSlab),
    merchantSlabController.getMerchantSlab
  )
  .patch(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'update', allowOwn: true }),
    validate(merchantSlabValidation.updateMerchantSlab),
    merchantSlabController.updateMerchantSlab
  )
  .delete(
    verifyToken,
    checkPermission('MERCHANT_SLAB', { action: 'delete', allowOwn: true }),
    validate(merchantSlabValidation.deleteMerchantSlab),
    merchantSlabController.deleteMerchantSlab
  );

module.exports = router; 