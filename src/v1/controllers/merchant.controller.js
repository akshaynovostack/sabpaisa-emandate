const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { merchantService } = require('../../services');
const { success } = require('../../utils/response');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const { decAESString, encAESString, jsonToQueryParams, parseQueryString, decryptAesGcm, aesGcmEncrypt } = require('../../helpers/common-helper');
const logger = require('../../config/logger');

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

/**
 * Calculate mandate details based on merchant ID and payout amount
 * @route GET /api/v1/merchants/calculate-mandate
 */
const calculateMandateDetails = catchAsync(async (req, res) => {
  
  const { encReq } = req.query;
  logger.debug(`Encrypted request from calculate mandate: ${encReq}`);

  // Decrypt the response
  const inputData = await decryptAesGcm(encReq);
  logger.debug(`Decrypted input data from calculate mandate: ${inputData}`);

  // Convert the 'data' string into an object
  const parsedData = parseQueryString(inputData);
  logger.debug('Parsed data from calculate mandate:', parsedData);

  const { merchant_id, payment_amount } = parsedData;

  if (!merchant_id || !payment_amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Merchant ID and payment amount are required'
    );
  }

  const paymentAmount = parseFloat(payment_amount);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Payout amount must be a valid positive number'
    );
  }

  const mandateDetails = await merchantService.calculateMandateDetails(
    merchant_id,
    paymentAmount
  );
  const encryptedResponse = await aesGcmEncrypt(jsonToQueryParams(mandateDetails));

  logger.debug('Encrypted mandate details response from calculate mandate:', encryptedResponse);

  return success(res, {
    message: 'Mandate details calculated successfully',
    data: {encryptedResponse},
  });
});
module.exports = {
  createMerchant,
  getMerchants,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  calculateMandateDetails,
}; 