const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../helpers/logger');

// Create a new merchant
const createMerchant = async (data) => {
  try {
    logger.info('Creating new merchant');
    return await prisma.merchant.create({ data });
  } catch (error) {
    logger.error('Error in createMerchant:', error);
    throw error;
  }
};

// Get a single merchant by ID
const getMerchant = async (id) => {
  try {
    logger.info(`Fetching merchant with ID: ${id}`);
    return await prisma.merchant.findUnique({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    logger.error('Error in getMerchant:', error);
    throw error;
  }
};

// Get all merchants
const getMerchants = async () => {
  try {
    logger.info('Fetching all merchants');
    return await prisma.merchant.findMany();
  } catch (error) {
    logger.error('Error in getMerchants:', error);
    throw error;
  }
};

// Update a merchant by ID
const updateMerchant = async (id, data) => {
  try {
    logger.info(`Updating merchant with ID: ${id}`);
    return await prisma.merchant.update({
      where: { id: parseInt(id) },
      data,
    });
  } catch (error) {
    logger.error('Error in updateMerchant:', error);
    throw error;
  }
};

// Delete a merchant by ID
const deleteMerchant = async (id) => {
  try {
    logger.info(`Deleting merchant with ID: ${id}`);
    return await prisma.merchant.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    logger.error('Error in deleteMerchant:', error);
    throw error;
  }
};

const saveOrUpdateMerchant = async (data) => {
  try {
    logger.info(`Checking for existing merchant with merchant_code: ${data.merchant_code}`);

    // Use findFirst to look up a non-unique field
    const existingMerchant = await prisma.merchant.findFirst({
      where: { merchant_code: data.merchant_code },
    });

    if (existingMerchant) {
      logger.info(`Updating existing merchant with merchant_code: ${data.merchant_code}`);
      return await prisma.merchant.update({
        where: { id: existingMerchant.id }, // Use the unique `id` to update
        data,
      });
    } else {
      logger.warn(`Merchant not found with merchant_code: ${data.merchant_code}`);
      return { error: 'Merchant not found', code: 404 };
    }
  } catch (error) {
    logger.error('Error in saveOrUpdateMerchant:', error);
    throw error;
  }
};


module.exports = {
  createMerchant,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  getMerchants,
  saveOrUpdateMerchant,
};
