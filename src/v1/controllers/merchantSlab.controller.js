const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { merchantSlabService, merchantService } = require('../../services');
const { success } = require('../../utils/response');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

/**
 * Create a merchant slab
 */
const createMerchantSlab = catchAsync(async (req, res) => {
  const { merchantId } = req.params;
  
  // Verify merchant exists
  const merchant = await merchantService.getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  // Prepare request body
  const slabBody = {
    ...req.body,
    merchant_id: merchantId,
    // Convert string amounts to numbers
    slab_from: req.body.slab_from,
    slab_to: req.body.slab_to,
    base_amount: req.body.base_amount,
    emi_amount: req.body.emi_amount,
    emi_tenure: req.body.emi_tenure,
    duration: req.body.duration,
    processing_fee: req.body.processing_fee,
    processing_fee_percentage: req.body.processing_fee_percentage,
    // Convert status to number if provided
    status: req.body.status !== undefined ? Number(req.body.status) : 1,
    // Ensure dates are in ISO format
    effective_date: req.body.effective_date,
    expiry_date: req.body.expiry_date,
  };

  const slab = await merchantSlabService.createMerchantSlab(slabBody);
  
  return success(res, {
    message: 'Merchant slab created successfully',
    data: {
      slab: {
        ...slab,
        created_at: new Date(),
        updated_at: new Date(),
      }
    }
  });
});

/**
 * Get merchant slabs with filters
 */
const getMerchantSlabs = catchAsync(async (req, res) => {
  const { merchantId } = req.params;
  
  // Verify merchant exists
  const merchant = await merchantService.getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  const filter = { merchant_id: merchantId };
  const options = pick(req.query, [
    'sortBy',
    'limit',
    'page',
    'search',
    'frequency',
    'mandate_category',
    'status',
    'amount_range',
    'date_range',
    'is_active',
  ]);

  // Convert numeric query parameters
  if (options.status !== undefined) {
    options.status = Number(options.status);
  }
  if (options.amount_range) {
    options.amount_range = {
      min: Number(options.amount_range.min),
      max: Number(options.amount_range.max),
    };
  }

  const result = await merchantSlabService.getAllMerchantSlabs(filter, options);
  
  return success(res, {
    message: 'Merchant slabs retrieved successfully',
    data: {
      slabs: result.results.map(slab => ({
        ...slab,
        // Format numeric fields to 2 decimal places
        slab_from: Number(slab.slab_from).toFixed(2),
        slab_to: Number(slab.slab_to).toFixed(2),
        base_amount: Number(slab.base_amount).toFixed(2),
        emi_amount: Number(slab.emi_amount).toFixed(2),
        processing_fee: Number(slab.processing_fee).toFixed(2),
      })),
      pagination: {
        total: result.totalResults,
        page: Number(result.page),
        limit: Number(result.limit),
        pages: result.totalPages,
      }
    },
    meta: {
      totalCount: result.totalResults,
      currentPage: Number(result.page),
      totalPages: result.totalPages
    }
  });
});

/**
 * Get merchant slab by id
 */
const getMerchantSlab = catchAsync(async (req, res) => {
  const { merchantId, slabId } = req.params;
  
  // Verify merchant exists
  const merchant = await merchantService.getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  const slab = await merchantSlabService.getMerchantSlabById(slabId);
  
  // Verify slab belongs to merchant
  if (slab.merchant_id !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Slab does not belong to this merchant');
  }

  // Format numeric fields
  const formattedSlab = {
    ...slab,
    slab_from: Number(slab.slab_from).toFixed(2),
    slab_to: Number(slab.slab_to).toFixed(2),
    base_amount: Number(slab.base_amount).toFixed(2),
    emi_amount: Number(slab.emi_amount).toFixed(2),
    processing_fee: Number(slab.processing_fee).toFixed(2),
  };

  return success(res, {
    message: 'Merchant slab retrieved successfully',
    data: {
      slab: formattedSlab
    }
  });
});

/**
 * Update merchant slab
 */
const updateMerchantSlab = catchAsync(async (req, res) => {
  const { merchantId, slabId } = req.params;
  
  // Verify merchant exists
  const merchant = await merchantService.getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  const slab = await merchantSlabService.getMerchantSlabById(slabId);
  
  // Verify slab belongs to merchant
  if (slab.merchant_id !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Slab does not belong to this merchant');
  }

  // Prepare update body
  const updateBody = {
    ...req.body,
    // Convert status to number if provided
    ...(req.body.status !== undefined && { status: Number(req.body.status) }),
  };

  const updatedSlab = await merchantSlabService.updateMerchantSlabById(slabId, updateBody);
  
  // Format numeric fields
  const formattedSlab = {
    ...updatedSlab,
    slab_from: Number(updatedSlab.slab_from).toFixed(2),
    slab_to: Number(updatedSlab.slab_to).toFixed(2),
    base_amount: Number(updatedSlab.base_amount).toFixed(2),
    emi_amount: Number(updatedSlab.emi_amount).toFixed(2),
    processing_fee: Number(updatedSlab.processing_fee).toFixed(2),
  };

  return success(res, {
    message: 'Merchant slab updated successfully',
    data: {
      slab: {
        ...formattedSlab,
        updated_at: new Date(),
      }
    }
  });
});

/**
 * Delete merchant slab
 */
const deleteMerchantSlab = catchAsync(async (req, res) => {
  const { merchantId, slabId } = req.params;
  
  // Verify merchant exists
  const merchant = await merchantService.getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  const slab = await merchantSlabService.getMerchantSlabById(slabId);
  
  // Verify slab belongs to merchant
  if (slab.merchant_id !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Slab does not belong to this merchant');
  }

  await merchantSlabService.deleteMerchantSlabById(slabId);
  
  return success(res, {
    message: 'Merchant slab deleted successfully',
    data: {
      id: slabId,
      deleted_at: new Date(),
    }
  });
});

module.exports = {
  createMerchantSlab,
  getMerchantSlabs,
  getMerchantSlab,
  updateMerchantSlab,
  deleteMerchantSlab,
}; 