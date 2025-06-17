const {status:httpStatus} = require('http-status');
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
 * Calculate mandate details based on merchant ID and payment amount
 * @param {string} merchantId
 * @param {number} paymentAmount
 * @returns {Promise<Object>}
 */
const calculateMandateDetails = async (merchantId, paymentAmount) => {
  // Frequency mapping
  const frequencies = [
    { code: 'BIMN', description: 'Bi-Monthly', id: 2 },
    { code: 'DAIL', description: 'Daily', id: 3 },
    { code: 'MNTH', description: 'Monthly', id: 4 },
    { code: 'QURT', description: 'Quarterly', id: 5 },
    { code: 'MIAN', description: 'Semi', id: 6 },
    { code: 'WEEK', description: 'Weekly', id: 7 },
    { code: 'YEAR', description: 'Yearly', id: 8 }
  ];

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

  // Find the appropriate slab for the payment amount
  const applicableSlab = merchant.merchant_slabs.find(
    (slab) => 
      parseFloat(slab.slab_from) <= paymentAmount && 
      parseFloat(slab.slab_to) >= paymentAmount
  );

  if (!applicableSlab) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment amount ${paymentAmount} is not within any active slab range for merchant ${merchantId}`
    );
  }

  // Extract slab details
  const slabFrom = parseFloat(applicableSlab.slab_from);
  const slabTo = parseFloat(applicableSlab.slab_to);
  const baseAmount = parseFloat(applicableSlab.base_amount);
  const emiTenure = parseInt(applicableSlab.emi_tenure);
  const processingFeePercentage = parseFloat(applicableSlab.processing_fee) || 0;
  const frequency = applicableSlab.frequency;

  // Calculate based on the specified formula
  // Total Amount = Payment amount from request (not average of slab range)
  const totalAmount = paymentAmount;
  
  // Number of Payments = EMI Tenure (already in months, no need to multiply by frequency)
  const numberOfPayments = emiTenure;
  
  // EMI Amount = (Total Amount - Base Amount) / Number of Payments
  const emiAmount = (totalAmount - baseAmount) / numberOfPayments;
  
  // Total EMI Amount = EMI Amount × Number of Payments
  const totalEmiAmount = emiAmount * numberOfPayments;
  
  // Processing Fee = Processing Fee Percentage × Total Amount
  const processingFee = (processingFeePercentage / 100) * totalAmount;
  
  // Total Payable = Base Amount + Total EMI Amount + Processing Fee
  const totalPayable = baseAmount + totalEmiAmount + processingFee;

  // Calculate mandate dates
  const startDate = new Date();
  const endDate = new Date();
  
  // Calculate duration based on frequency and EMI tenure
  let durationInMonths = emiTenure; // Default to EMI tenure in months
  
  // Adjust duration based on frequency
  switch (frequency) {
    case 'DAIL': // Daily - convert to months (approximate)
      durationInMonths = Math.ceil(emiTenure / 30);
      break;
    case 'WEEK': // Weekly - convert to months (approximate)
      durationInMonths = Math.ceil(emiTenure / 4);
      break;
    case 'MNTH': // Monthly - duration is same as EMI tenure
      durationInMonths = emiTenure;
      break;
    case 'BIMN': // Bi-monthly - convert to months
      durationInMonths = emiTenure * 2;
      break;
    case 'QURT': // Quarterly - convert to months
      durationInMonths = emiTenure * 3;
      break;
    case 'MIAN': // Semi-annually - convert to months
      durationInMonths = emiTenure * 6;
      break;
    case 'YEAR': // Yearly - convert to months
      durationInMonths = emiTenure * 12;
      break;
    default: // Default to monthly
      durationInMonths = emiTenure;
  }
  
  // Calculate end date based on calculated duration
  endDate.setMonth(endDate.getMonth() + durationInMonths);

  // Get frequency details
  const frequencyDetails = frequencies.find(f => f.code === frequency) || { code: frequency, description: 'Unknown', id: 0 };

  return {
    merchant_id: merchantId,
    merchant_name: merchant.name,
    payment_amount: paymentAmount,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    total_emis: numberOfPayments,
    convenience_fee: processingFee,
    emi_amount: emiAmount,
    downpayment: baseAmount,
    total_amount: totalAmount,
    total_emi_amount: totalEmiAmount,
    total_payable: totalPayable,
    frequency: {
      code: frequencyDetails.code,
      description: frequencyDetails.description,
      id: frequencyDetails.id
    },
    duration: durationInMonths,
    calculation_details: {
      slab_from: slabFrom,
      slab_to: slabTo,
      base_amount: baseAmount,
      emi_tenure: emiTenure,
      frequency_multiplier: 1, // Frequency multiplier is not provided in the new calculation
      processing_fee_percentage: processingFeePercentage,
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