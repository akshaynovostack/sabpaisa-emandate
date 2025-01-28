const express = require('express');
const { handleCreateMandate, webHook } = require('../controllers/mandateController');
const router = express.Router();

router.get('/create', handleCreateMandate);
router.get('/web-hook/:id', webHook);

module.exports = router;