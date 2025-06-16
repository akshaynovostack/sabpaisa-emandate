const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { mandateService } = require('../../services');
const logger = require('../../config/logger');
const { success, error } = require('../../utils/response');
const pick = require('../../utils/pick');

/**
 * Create a mandate
 */
const createMandate = catchAsync(async (req, res) => {
  const mandate = await mandateService.createMandate(req.body);
  logger.info('Mandate created', { mandateId: mandate.id });
  return success(res, {
    message: 'Mandate created successfully',
    data: mandate,
    statusCode: httpStatus.CREATED
  });
});

/**
 * Get mandate by id
 */
const getMandate = catchAsync(async (req, res) => {
  const mandate = await mandateService.getMandateById(req.params.mandateId);
  if (!mandate) {
    return error(res, {
      message: 'Mandate not found',
      statusCode: httpStatus.NOT_FOUND
    });
  }
  return success(res, {
    message: 'Mandate retrieved successfully',
    data: mandate
  });
});

/**
 * Get all mandates
 */
const getMandates = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user_id', 'transaction_id', 'registration_status', 'bank_status_message']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'search', 'date_range', 'amount_range']);
  
  const { results, total } = await mandateService.getAllMandates(filter, options);
  const { page = 1, limit = 10 } = options;

  return success(res, {
    message: 'Mandates retrieved successfully',
    data: {
      mandates:results,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      }
    },
    meta: {
      totalCount: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Update mandate by id
 */
const updateMandate = catchAsync(async (req, res) => {
  const mandate = await mandateService.updateMandateById(req.params.mandateId, req.body);
  if (!mandate) {
    return error(res, {
      message: 'Mandate not found',
      statusCode: httpStatus.NOT_FOUND
    });
  }
  logger.info('Mandate updated', { mandateId: mandate.id });
  return success(res, {
    message: 'Mandate updated successfully',
    data: mandate
  });
});

/**
 * Delete mandate by id
 */
const deleteMandate = catchAsync(async (req, res) => {
  const mandate = await mandateService.deleteMandateById(req.params.mandateId);
  if (!mandate) {
    return error(res, {
      message: 'Mandate not found',
      statusCode: httpStatus.NOT_FOUND
    });
  }
  logger.info('Mandate deleted', { mandateId: mandate.id });
  return success(res, {
    message: 'Mandate deleted successfully',
    data: null,
    statusCode: httpStatus.NO_CONTENT
  });
});

module.exports = {
  createMandate,
  getMandate,
  getMandates,
  updateMandate,
  deleteMandate,
}; 