const express = require('express');
const merchantslabController = require('../controllers/merchantslabController');
const router = express.Router();

router.post('/', merchantslabController.createMerchantSlab);
router.get('/:id', merchantslabController.getMerchantSlab);
router.put('/:id', merchantslabController.updateMerchantSlab);
router.delete('/:id', merchantslabController.deleteMerchantSlab);

module.exports = router;