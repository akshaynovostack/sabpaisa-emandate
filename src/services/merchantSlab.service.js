const {status:httpStatus} = require('http-status');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

/**
 * Convert string amounts to numbers and validate data types
 * @param {Object} slabBody
 * @returns {Object}
 */
const prepareSlabData = (slabBody) => {
  const data = { ...slabBody };
  
  // Convert string amounts to numbers
  const amountFields = ['slab_from', 'slab_to', 'base_amount', 'emi_amount', 'processing_fee'];
  amountFields.forEach(field => {
    if (data[field] !== undefined) {
      data[field] = parseFloat(data[field]);
    }
  });

  // Convert string numbers to integers
  const integerFields = ['emi_tenure', 'duration', 'status'];
  integerFields.forEach(field => {
    if (data[field] !== undefined) {
      data[field] = parseInt(data[field], 10);
    }
  });

  // Convert dates to Date objects
  const dateFields = ['effective_date', 'expiry_date'];
  dateFields.forEach(field => {
    if (data[field] !== undefined) {
      data[field] = new Date(data[field]);
    }
  });

  return data;
};

/**
 * Check if two slab ranges overlap
 * @param {Object} slab1 - First slab range
 * @param {Object} slab2 - Second slab range
 * @returns {boolean}
 */
const doSlabsOverlap = (slab1, slab2) => {
  // Convert to numbers for comparison
  const from1 = parseFloat(slab1.slab_from);
  const to1 = parseFloat(slab1.slab_to);
  const from2 = parseFloat(slab2.slab_from);
  const to2 = parseFloat(slab2.slab_to);

  // Check if ranges overlap
  return (from1 <= to2 && to1 >= from2);
};

/**
 * Create a merchant slab
 * @param {Object} slabBody
 * @returns {Promise<MerchantSlab>}
 */
const createMerchantSlab = async (slabBody) => {
  // Verify merchant exists
  const merchant = await prisma.merchant.findUnique({
    where: { merchant_id: slabBody.merchant_id },
  });

  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  // Prepare and validate data
  const data = prepareSlabData(slabBody);

  // Validate slab range
  if (data.slab_from >= data.slab_to) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Slab from amount must be less than slab to amount'
    );
  }

  // Validate EMI amount and tenure
  if (data.emi_amount && data.emi_tenure) {
    if (data.emi_amount < 0 && data.emi_tenure <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid EMI amount or tenure'
      );
    }
  }

  // Validate processing fee
  if (data.processing_fee) {
    if (data.processing_fee < 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Processing fee must be non-negative'
      );
    }
  }

  // Check for overlapping slabs
  const existingSlabs = await prisma.merchant_slab.findMany({
    where: {
      merchant: {
        merchant_id: data.merchant_id
      },
      // Only consider active slabs
      AND: [
        { effective_date: { lte: new Date() } },
        {
          OR: [
            { expiry_date: null },
            { expiry_date: { gt: new Date() } },
          ],
        },
      ],
    },
  });

  // Check if new slab overlaps with any existing active slab
  const hasOverlap = existingSlabs.some(existingSlab => 
    doSlabsOverlap(
      { slab_from: data.slab_from, slab_to: data.slab_to },
      { slab_from: existingSlab.slab_from, slab_to: existingSlab.slab_to }
    )
  );

  if (hasOverlap) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Slab range overlaps with existing active slab. Please check the current slab ranges.'
    );
  }

  // Create the merchant slab using the merchant relation
  return prisma.merchant_slab.create({
    data: {
      merchant: {
        connect: {
          merchant_id: data.merchant_id
        }
      },
      slab_from: data.slab_from,
      slab_to: data.slab_to,
      base_amount: data.base_amount,
      emi_amount: data.emi_amount,
      emi_tenure: data.emi_tenure,
      frequency: data.frequency,
      duration: data.duration,
      processing_fee: data.processing_fee,
      effective_date: data.effective_date,
      expiry_date: data.expiry_date,
      remarks: data.remarks,
      mandate_category: data.mandate_category,
      status: data.status,
    },
    include: {
      merchant: {
        select: {
          merchant_id: true,
          name: true,
          merchant_code: true,
        },
      },
    },
  });
};

/**
 * Get merchant slab by id
 * @param {string} id
 * @returns {Promise<MerchantSlab>}
 */
const getMerchantSlabById = async (id) => {
  const slab = await prisma.merchant_slab.findUnique({
    where: { id: parseInt(id) },
    include: {
      merchant: {
        select: {
          merchant_id: true,
          name: true,
          merchant_code: true,
        },
      },
    },
  });

  if (!slab) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant slab not found');
  }

  return slab;
};

/**
 * Get all merchant slabs with advanced filtering
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllMerchantSlabs = async (filter, options) => {
  const {
    limit = 10,
    page = 1,
    sortBy,
    search,
    merchant_id,
    frequency,
    mandate_category,
    status,
    amount_range,
    date_range,
    is_active,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause with advanced filters
  const where = {
    ...filter,
    ...(merchant_id && { 
      merchant: {
        merchant_id: merchant_id
      }
    }),
    ...(frequency && { frequency }),
    ...(mandate_category && { mandate_category }),
    ...(status !== undefined && { status: parseInt(status, 10) }),
    ...(search && {
      OR: [
        { merchant: { name: { contains: search, mode: 'insensitive' } } },
        { merchant: { merchant_id: { contains: search, mode: 'insensitive' } } },
        { merchant: { merchant_code: { contains: search, mode: 'insensitive' } } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(amount_range && {
      AND: [
        { slab_from: { gte: parseFloat(amount_range.min) } },
        { slab_to: { lte: parseFloat(amount_range.max) } },
      ],
    }),
    ...(date_range && {
      AND: [
        { effective_date: { gte: new Date(date_range.start) } },
        {
          OR: [
            { expiry_date: null },
            { expiry_date: { lte: new Date(date_range.end) } },
          ],
        },
      ],
    }),
    ...(is_active !== undefined && {
      OR: [
        {
          AND: [
            { effective_date: { lte: new Date() } },
            {
              OR: [
                { expiry_date: null },
                { expiry_date: { gt: new Date() } },
              ],
            },
          ],
        },
      ],
    }),
  };

  // Build orderBy clause
  const orderBy = sortBy
    ? {
        [sortBy.split(':')[0]]: sortBy.split(':')[1] || 'desc',
      }
    : { created_at: 'desc' };

  const [slabs, total] = await Promise.all([
    prisma.merchant_slab.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        merchant: {
          select: {
            merchant_id: true,
            name: true,
            merchant_code: true,
          },
        },
      },
    }),
    prisma.merchant_slab.count({ where }),
  ]);

  // Add is_active flag to each slab
  const now = new Date();
  const slabsWithStatus = slabs.map(slab => ({
    ...slab,
    is_active: slab.effective_date <= now && (!slab.expiry_date || slab.expiry_date > now),
  }));

  return {
    results: slabsWithStatus,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

/**
 * Update merchant slab by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<MerchantSlab>}
 */
const updateMerchantSlabById = async (id, updateBody) => {
  const slab = await getMerchantSlabById(id);

  // Prepare and validate data
  const data = prepareSlabData(updateBody);

  // If merchant_id is being updated, verify new merchant exists
  if (data.merchant_id && data.merchant_id !== slab.merchant_id) {
    const merchant = await prisma.merchant.findUnique({
      where: { merchant_id: data.merchant_id },
    });

    if (!merchant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
    }
  }

  // Validate slab range if being updated
  if (data.slab_from || data.slab_to) {
    const from = data.slab_from || slab.slab_from;
    const to = data.slab_to || slab.slab_to;
    
    if (from >= to) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Slab from amount must be less than slab to amount'
      );
    }
  }

  // Validate EMI amount and tenure if being updated
  if (data.emi_amount !== undefined || data.emi_tenure !== undefined) {
    const emiAmount = data.emi_amount ?? slab.emi_amount;
    const emiTenure = data.emi_tenure ?? slab.emi_tenure;
    
    if (emiAmount < 0 && emiTenure <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid EMI amount or tenure'
      );
    }
  }

  // Validate processing fee if being updated
  if (data.processing_fee !== undefined) {
    const processingFee = data.processing_fee ?? slab.processing_fee;
    
    if (processingFee < 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Processing fee must be non-negative'
      );
    }
  }

  // Check for overlapping slabs if slab range is being updated
  if (data.slab_from || data.slab_to) {
    const existingSlabs = await prisma.merchant_slab.findMany({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            merchant: {
              merchant_id: data.merchant_id || slab.merchant_id
            }
          },
          // Only consider active slabs
          { effective_date: { lte: new Date() } },
          {
            OR: [
              { expiry_date: null },
              { expiry_date: { gt: new Date() } },
            ],
          },
        ],
      },
    });

    const newSlabRange = {
      slab_from: data.slab_from || slab.slab_from,
      slab_to: data.slab_to || slab.slab_to,
    };

    // Check if updated slab overlaps with any existing active slab
    const hasOverlap = existingSlabs.some(existingSlab => 
      doSlabsOverlap(
        newSlabRange,
        { slab_from: existingSlab.slab_from, slab_to: existingSlab.slab_to }
      )
    );

    if (hasOverlap) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Slab range overlaps with existing active slab. Please check the current slab ranges.'
      );
    }
  }

  const updatedSlab = await prisma.merchant_slab.update({
    where: { id: parseInt(id) },
    data,
    include: {
      merchant: {
        select: {
          merchant_id: true,
          name: true,
          merchant_code: true,
        },
      },
    },
  });

  // Add is_active flag
  const now = new Date();
  return {
    ...updatedSlab,
    is_active: updatedSlab.effective_date <= now && (!updatedSlab.expiry_date || updatedSlab.expiry_date > now),
  };
};

/**
 * Delete merchant slab by id
 * @param {string} id
 * @returns {Promise<MerchantSlab>}
 */
const deleteMerchantSlabById = async (id) => {
  const slab = await getMerchantSlabById(id);

  // Check if slab is active
  const now = new Date();
  const isActive = slab.effective_date <= now && (!slab.expiry_date || slab.expiry_date > now);
  
  if (isActive) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete active merchant slab'
    );
  }

  return prisma.merchant_slab.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createMerchantSlab,
  getMerchantSlabById,
  getAllMerchantSlabs,
  updateMerchantSlabById,
  deleteMerchantSlabById,
}; 