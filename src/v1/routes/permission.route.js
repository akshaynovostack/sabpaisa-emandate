const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const permissionValidation = require('../validations/permission.validation');
const permissionController = require('../controllers/permission.controller');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();

router
  .route('/')
  .post(
    verifyToken,
    checkPermission('PERMISSION', { action: 'create', allowOwn: false }),
    validate(permissionValidation.createPermission),
    permissionController.createPermission
  )
  .get(
    verifyToken,

    checkPermission('PERMISSION', { action: 'read', allowOwn: false }),
    validate(permissionValidation.getPermissions),
    permissionController.getPermissions
  );

router
  .route('/:permissionId')
  .get(
    verifyToken,
    checkPermission('PERMISSION', { action: 'read', allowOwn: false }),
    validate(permissionValidation.getPermission),
    permissionController.getPermission
  )
  .patch(
    verifyToken,
    checkPermission('PERMISSION', { action: 'update', allowOwn: false }),
    validate(permissionValidation.updatePermission),
    permissionController.updatePermission
  )
  .delete(
    verifyToken,
    checkPermission('PERMISSION', { action: 'delete', allowOwn: false }),
    validate(permissionValidation.deletePermission),
    permissionController.deletePermission
  );

module.exports = router; 