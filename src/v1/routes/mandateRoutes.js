const express = require('express');
const { handleCreateMandate, webHook } = require('../controllers/mandateController');
const mandateController = require('../controllers/mandate.controller');
const validate = require('../../middlewares/validate');
const mandateValidation = require('../validations/mandate.validation');
const verifyToken = require('../../middlewares/verifyToken');
const checkPermission = require('../../middlewares/checkPermission');

const router = express.Router();

// Legacy routes (no auth required for webhook)
router.get('/create', handleCreateMandate);
router.post('/create', handleCreateMandate);
router.get('/web-hook/:id', webHook);

// New CRUD routes with auth and permissions
router
  .route('/')
  .post(
    verifyToken,
    checkPermission('MANDATE', { action: 'create', allowOwn: false }),
    validate(mandateValidation.createMandate),
    mandateController.createMandate
  )
  .get(
    verifyToken,
    checkPermission('MANDATE', { action: 'read', allowOwn: true }),
    validate(mandateValidation.getMandates),
    mandateController.getMandates
  );

router
  .route('/:mandateId')
  .get(
    verifyToken,
    checkPermission('MANDATE', { action: 'read', allowOwn: true }),
    validate(mandateValidation.getMandate),
    mandateController.getMandate
  )
  .patch(
    verifyToken,
    checkPermission('MANDATE', { action: 'update', allowOwn: false }),
    validate(mandateValidation.updateMandate),
    mandateController.updateMandate
  )
  .delete(
    verifyToken,
    checkPermission('MANDATE', { action: 'delete', allowOwn: false }),
    validate(mandateValidation.deleteMandate),
    mandateController.deleteMandate
  );

module.exports = router;