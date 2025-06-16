const merchantService = require('../../services/merchantService');
const logger = require('../../helpers/logger');
const { success, error } = require('../../utils/response');
const {status: httpStatus} = require('http-status');

const createMerchant = async (req, res) => {
  try {
    const merchant = await merchantService.createMerchant(req.body);
    logger.info('Merchant created successfully', { id: merchant.id });
    return success(res, {
      message: 'Merchant created successfully',
      data: { merchant },
      code: httpStatus.CREATED
    });
  } catch (err) {
    logger.error('Error creating Merchant', { error: err.message });
    return error(res, {
      message: err.message,
      code: httpStatus.INTERNAL_SERVER_ERROR
    });
  }
};

const getMerchants = async (req, res) => {
  try {
    const merchants = await merchantService.getMerchants();
    if (!merchants) {
      logger.warn('No merchants found');
      return error(res, {
        message: 'No merchants found',
        code: httpStatus.NOT_FOUND
      });
    }
    logger.info('Merchants retrieved successfully');
    return success(res, {
      message: 'Merchants retrieved successfully',
      data: { merchants }
    });
  } catch (err) {
    logger.error('Error retrieving Merchants', { error: err.message });
    return error(res, {
      message: err.message,
      code: httpStatus.INTERNAL_SERVER_ERROR
    });
  }
};

const getMerchant = async (req, res) => {
  try {
    const merchant = await merchantService.getMerchant(req.params.id);
    if (!merchant) {
      logger.warn('Merchant not found', { id: req.params.id });
      return error(res, {
        message: 'Merchant not found',
        code: httpStatus.NOT_FOUND
      });
    }
    logger.info('Merchant retrieved successfully', { id: req.params.id });
    return success(res, {
      message: 'Merchant retrieved successfully',
      data: { merchant }
    });
  } catch (err) {
    logger.error('Error retrieving Merchant', { error: err.message });
    return error(res, {
      message: err.message,
      code: httpStatus.INTERNAL_SERVER_ERROR
    });
  }
};

const updateMerchant = async (req, res) => {
  try {
    const merchant = await merchantService.updateMerchant(req.params.id, req.body);
    logger.info('Merchant updated successfully', { id: req.params.id });
    return success(res, {
      message: 'Merchant updated successfully',
      data: { merchant }
    });
  } catch (err) {
    logger.error('Error updating Merchant', { error: err.message });
    return error(res, {
      message: err.message,
      code: httpStatus.INTERNAL_SERVER_ERROR
    });
  }
};

const deleteMerchant = async (req, res) => {
  try {
    await merchantService.deleteMerchant(req.params.id);
    logger.info('Merchant deleted successfully', { id: req.params.id });
    return success(res, {
      message: 'Merchant deleted successfully',
      code: httpStatus.NO_CONTENT
    });
  } catch (err) {
    logger.error('Error deleting Merchant', { error: err.message });
    return error(res, {
      message: err.message,
      code: httpStatus.INTERNAL_SERVER_ERROR
    });
  }
};

module.exports = {
  createMerchant,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  getMerchants
};