const express = require('express');
const merchantController = require('../controllers/merchantController');
const router = express.Router();

router.post('/', merchantController.createMerchant);
router.get('/', merchantController.getMerchants);
router.get('/:id', merchantController.getMerchant);
router.put('/:id', merchantController.updateMerchant);
router.delete('/:id', merchantController.deleteMerchant);

module.exports = router;