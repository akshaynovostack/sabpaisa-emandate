const express = require('express');
const checkPermission = require('../../middlewares/checkPermission');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');
const userValidation = require('../validations/user.validation');
const userController = require('../controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .post(
    verifyToken,
    checkPermission('USERINFO', { action: 'create', allowOwn: false }),
    validate(userValidation.createUser),
    userController.createUser
  )
  .get(
    verifyToken,
    checkPermission('USERINFO', { action: 'read', allowOwn: false }),
    validate(userValidation.getUsers),
    userController.getUsers
  );

router
  .route('/:userId')
  .get(
    verifyToken,
    checkPermission('USERINFO', { action: 'read', allowOwn: false }),
    validate(userValidation.getUser),
    userController.getUser
  )
  .patch(
    verifyToken,
    checkPermission('USERINFO', { action: 'update', allowOwn: false }),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    verifyToken,
    checkPermission('USERINFO', { action: 'delete', allowOwn: false }),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

module.exports = router; 