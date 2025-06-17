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

/**
 * Calculate mandate details based on merchant ID and payout amount
 * @param {string} merchantId
 * @param {number} payoutAmount
 * @returns {Promise<Object>}
 */
const calculateMandateDetails = async (merchantId, payoutAmount) => {
  // First, verify merchant exists
  const merchant = await prisma.merchant.findUnique({
    where: { merchant_id: merchantId },
    include: {
      merchant_slabs: {
        where: {
          AND: [
            { status: 1 }, // Active slabs only
            { effective_date: { lte: new Date() } },
            {
              OR: [
                { expiry_date: null },
                { expiry_date: { gt: new Date() } },
              ],
            },
          ],
        },
        orderBy: { slab_from: 'asc' },
      },
    },
  });

  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  if (!merchant.merchant_slabs || merchant.merchant_slabs.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'No active slabs found for this merchant'
    );
  }

  // Find the appropriate slab for the payout amount
  const applicableSlab = merchant.merchant_slabs.find(
    (slab) => 
      parseFloat(slab.slab_from) <= payoutAmount && 
      parseFloat(slab.slab_to) >= payoutAmount
  );

  if (!applicableSlab) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payout amount ${payoutAmount} is not within any active slab range for merchant ${merchantId}`
    );
  }

  // Calculate mandate details
  const startDate = new Date();
  const endDate = new Date();
  
  // Calculate end date based on duration and frequency
  const duration = parseInt(applicableSlab.duration) || 12; // Default to 12 months
  const frequency = applicableSlab.frequency;
  
  switch (frequency) {
    case 'DAIL': // Daily
      endDate.setDate(endDate.getDate() + duration);
      break;
    case 'WEEK': // Weekly
      endDate.setDate(endDate.getDate() + (duration * 7));
      break;
    case 'MNTH': // Monthly
      endDate.setMonth(endDate.getMonth() + duration);
      break;
    case 'BIMN': // Bi-monthly
      endDate.setMonth(endDate.getMonth() + (duration * 2));
      break;
    case 'QURT': // Quarterly
      endDate.setMonth(endDate.getMonth() + (duration * 3));
      break;
    case 'YEAR': // Yearly
      endDate.setFullYear(endDate.getFullYear() + duration);
      break;
    default: // Default to monthly
      endDate.setMonth(endDate.getMonth() + duration);
  }

  // Calculate convenience fee
  const convenienceFee = parseFloat(applicableSlab.processing_fee) || 0;
  
  // Calculate EMI amount
  const emiAmount = parseFloat(applicableSlab.emi_amount) || 0;
  
  // Calculate total EMIs
  const totalEmis = Math.ceil(duration);

  return {
    merchant_id: merchantId,
    merchant_name: merchant.name,
    payout_amount: payoutAmount,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    total_emis: totalEmis,
    convenience_fee: convenienceFee,
    emi_amount: emiAmount,
    frequency: frequency,
    duration: duration,
    slab_details: {
      slab_from: parseFloat(applicableSlab.slab_from),
      slab_to: parseFloat(applicableSlab.slab_to),
      base_amount: parseFloat(applicableSlab.base_amount),
      emi_tenure: parseInt(applicableSlab.emi_tenure),
      mandate_category: applicableSlab.mandate_category,
    }
  };
};

module.exports = {
  createMerchant,
  getMerchantById,
  getAllMerchants,
  updateMerchantById,
  deleteMerchantById,
  calculateMandateDetails,
}; 