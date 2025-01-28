const express = require('express');
const usermandateController = require('../controllers/usermandateController');
const router = express.Router();

router.post('/', usermandateController.createUserMandate);
router.get('/:id', usermandateController.getUserMandate);
router.put('/:id', usermandateController.updateUserMandate);
router.delete('/:id', usermandateController.deleteUserMandate);

module.exports = router;