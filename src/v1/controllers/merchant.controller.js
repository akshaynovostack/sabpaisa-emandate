const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { merchantService } = require('../../services');
const { success } = require('../../utils/response');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

/**
 * Create a merchant
 */
const createMerchant = catchAsync(async (req, res) => {
  const merchant = await merchantService.createMerchant(req.body);
  return success(res, {
    message: 'Merchant created successfully',
    data: {
      merchant: {
        ...merchant,
        created_at: new Date(),
        updated_at: new Date(),
      }
    }
  });
});

/**
 * Get merchants with filters
 */
const getMerchants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'is_active']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'search']);
  const result = await merchantService.getAllMerchants(filter, options);
  
  return success(res, {
    message: 'Merchants retrieved successfully',
    data: {
      merchants: result.results,
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
 * Get merchant by id
 */
const getMerchant = catchAsync(async (req, res) => {
  const merchant = await merchantService.getMerchantById(req.params.merchantId);
  return success(res, {
    message: 'Merchant retrieved successfully',
    data: {
      merchant
    }
  });
});

/**
 * Update merchant
 */
const updateMerchant = catchAsync(async (req, res) => {
  const merchant = await merchantService.updateMerchantById(req.params.merchantId, req.body);
  return success(res, {
    message: 'Merchant updated successfully',
    data: {
      merchant: {
        ...merchant,
        updated_at: new Date(),
      }
    }
  });
});

/**
 * Delete merchant
 */
const deleteMerchant = catchAsync(async (req, res) => {
  await merchantService.deleteMerchantById(req.params.merchantId);
  return success(res, {
    message: 'Merchant deleted successfully',
    data: {
      merchant_id: req.params.merchantId,
      deleted_at: new Date(),
    }
  });
});

module.exports = {
  createMerchant,
  getMerchants,
  getMerchant,
  updateMerchant,
  deleteMerchant,
}; 