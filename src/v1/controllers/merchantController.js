const merchantService = require('../../services/merchantService');
const logger = require('../../helpers/logger');

const createMerchant = async (req, res) => {
  try {
    const merchant = await merchantService.createMerchant(req.body);
    logger.info('Merchant created successfully', { id: merchant.id });
    res.status(201).json(merchant);
  } catch (error) {
    logger.error('Error creating Merchant', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getMerchants = async (req, res) => {
  try {
    const merchant = await merchantService.getMerchants();
    if (!merchant) {
      logger.warn('Merchant not found', { id: req.params.id });
      return res.status(404).json({ message: 'Merchant not found' });
    }
    logger.info('Merchant retrieved successfully', { id: req.params.id });
    res.json(merchant);
  } catch (error) {
    logger.error('Error retrieving Merchant', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};
const getMerchant = async (req, res) => {
  try {
    const merchant = await merchantService.getMerchant(req.params.id);
    if (!merchant) {
      logger.warn('Merchant not found', { id: req.params.id });
      return res.status(404).json({ message: 'Merchant not found' });
    }
    logger.info('Merchant retrieved successfully', { id: req.params.id });
    res.json(merchant);
  } catch (error) {
    logger.error('Error retrieving Merchant', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const updateMerchant = async (req, res) => {
  try {
    const merchant = await merchantService.updateMerchant(req.params.id, req.body);
    logger.info('Merchant updated successfully', { id: req.params.id });
    res.json(merchant);
  } catch (error) {
    logger.error('Error updating Merchant', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const deleteMerchant = async (req, res) => {
  try {
    await merchantService.deleteMerchant(req.params.id);
    logger.info('Merchant deleted successfully', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting Merchant', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMerchant,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  getMerchants
};