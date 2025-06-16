const httpStatus = require('http-status');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

/**
 * Create a merchant
 * @param {Object} merchantBody
 * @returns {Promise<Merchant>}
 */
const createMerchant = async (merchantBody) => {
  // Check if merchant with same merchant_id or merchant_code exists
  const existingMerchant = await prisma.merchant.findFirst({
    where: {
      OR: [
        { merchant_id: merchantBody.merchant_id },
        { merchant_code: merchantBody.merchant_code }
      ]
    }
  });
  
  if (existingMerchant) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Merchant with this ID or code already exists'
    );
  }

  return prisma.merchant.create({
    data: merchantBody,
  });
};

/**
 * Get merchant by merchant_id
 * @param {string} merchantId
 * @returns {Promise<Merchant>}
 */
const getMerchantById = async (merchantId) => {
  const merchant = await prisma.merchant.findUnique({
    where: { merchant_id: merchantId },
    include: {
      merchant_slabs: true,
      transactions: true,
    },
  });
  
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }
  
  return merchant;
};

/**
 * Get all merchants
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllMerchants = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, search } = options;
  const skip = (page - 1) * limit;

  const where = {
    ...filter,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { merchant_id: { contains: search, mode: 'insensitive' } },
        { merchant_code: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: 'desc' } : { created_at: 'desc' },
      include: {
        merchant_slabs: {
          select: {
            id: true,
          },
        },
        transactions: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.merchant.count({ where }),
  ]);

  // Transform the results to include hasSlabs flag
  const transformedMerchants = merchants.map(merchant => ({
    ...merchant,
    hasSlabs: merchant.merchant_slabs.length > 0,
    merchant_slabs: undefined, // Remove the merchant_slabs array from response
    transactions: undefined, // Remove the transactions array from response
  }));

  return {
    results: transformedMerchants,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

/**
 * Update merchant by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Merchant>}
 */
const updateMerchantById = async (id, updateBody) => {
  const merchant = await getMerchantById(id);

  // Check if merchant_id or merchant_code is being updated and if it's unique
  if (updateBody.merchant_id || updateBody.merchant_code) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            OR: [
              { merchant_id: updateBody.merchant_id || merchant.merchant_id },
              { merchant_code: updateBody.merchant_code || merchant.merchant_code }
            ]
          }
        ]
      }
    });

    if (existingMerchant) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Merchant with this ID or code already exists'
      );
    }
  }

  return prisma.merchant.update({
    where: { id: parseInt(id) },
    data: updateBody,
    include: {
      merchant_slabs: true,
      transactions: true,
    },
  });
};

/**
 * Delete merchant by id
 * @param {string} id
 * @returns {Promise<Merchant>}
 */
const deleteMerchantById = async (id) => {
  const merchant = await getMerchantById(id);
  
  // Check if merchant has any transactions or slabs
  if (merchant.transactions.length > 0 || merchant.merchant_slabs.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete merchant with existing transactions or slabs'
    );
  }

  return prisma.merchant.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createMerchant,
  getMerchantById,
  getAllMerchants,
  updateMerchantById,
  deleteMerchantById,
}; 