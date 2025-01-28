const merchantslabService = require('../../services/merchantslabService');
const logger = require('../../helpers/logger');

const createMerchantSlab = async (req, res) => {
  try {
    const merchantslab = await merchantslabService.createMerchantSlab(req.body);
    logger.info('MerchantSlab created successfully', { id: merchantslab.id });
    res.status(201).json(merchantslab);
  } catch (error) {
    logger.error('Error creating MerchantSlab', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getMerchantSlab = async (req, res) => {
  try {
    const merchantslab = await merchantslabService.getMerchantSlab(req.params.id);
    if (!merchantslab) {
      logger.warn('MerchantSlab not found', { id: req.params.id });
      return res.status(404).json({ message: 'MerchantSlab not found' });
    }
    logger.info('MerchantSlab retrieved successfully', { id: req.params.id });
    res.json(merchantslab);
  } catch (error) {
    logger.error('Error retrieving MerchantSlab', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const updateMerchantSlab = async (req, res) => {
  try {
    const merchantslab = await merchantslabService.updateMerchantSlab(req.params.id, req.body);
    logger.info('MerchantSlab updated successfully', { id: req.params.id });
    res.json(merchantslab);
  } catch (error) {
    logger.error('Error updating MerchantSlab', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const deleteMerchantSlab = async (req, res) => {
  try {
    await merchantslabService.deleteMerchantSlab(req.params.id);
    logger.info('MerchantSlab deleted successfully', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting MerchantSlab', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMerchantSlab,
  getMerchantSlab,
  updateMerchantSlab,
  deleteMerchantSlab,
};