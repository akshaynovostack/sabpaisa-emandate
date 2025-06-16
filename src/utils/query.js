const {status: httpStatus} = require('http-status');
const config = require('../config/config');
const ApiError = require('./ApiError');
const logger = require('../config/logger');

/**
 * Generate and execute a database query
 * @param {Object} req - Request object containing postgres client
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function generateQuery(req, query, params = []) {
  try {
    const result = await req.postgres.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Database query error:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error executing database query'
    );
  }
}

/**
 * Calculate offset for pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {number} Offset value
 */
function getOffset(page = config.pagination.page, limit = config.pagination.limit) {
  return (page - 1) * limit;
}

/**
 * Build pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
function buildPagination(total, page = config.pagination.page, limit = config.pagination.limit) {
  return {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / limit),
  };
}

/**
 * Build search filter for Prisma
 * @param {string} search - Search term
 * @param {Array<string>} fields - Fields to search in
 * @returns {Object} Prisma where clause
 */
function buildSearchFilter(search, fields) {
  if (!search || !fields.length) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    })),
  };
}

/**
 * Build sort options for Prisma
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc/desc)
 * @param {Array<string>} allowedFields - Allowed fields for sorting
 * @returns {Object} Prisma orderBy clause
 */
function buildSortOptions(sortBy, sortOrder = 'asc', allowedFields = []) {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return { createdAt: 'desc' };
  }

  return {
    [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc',
  };
}

/**
 * Build date range filter for Prisma
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @param {string} field - Date field to filter on
 * @returns {Object} Prisma where clause
 */
function buildDateRangeFilter(startDate, endDate, field = 'createdAt') {
  const filter = {};

  if (startDate) {
    filter[field] = {
      ...filter[field],
      gte: new Date(startDate),
    };
  }

  if (endDate) {
    filter[field] = {
      ...filter[field],
      lte: new Date(endDate),
    };
  }

  return Object.keys(filter).length ? filter : {};
}

/**
 * Build select options for Prisma
 * @param {Array<string>} fields - Fields to select
 * @param {Object} relations - Relations to include
 * @returns {Object} Prisma select/include options
 */
function buildSelectOptions(fields = [], relations = {}) {
  const select = fields.length
    ? fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    : undefined;

  const include = Object.keys(relations).length ? relations : undefined;

  return { select, include };
}

/**
 * Sanitize query parameters
 * @param {Object} params - Query parameters
 * @param {Object} defaults - Default values
 * @returns {Object} Sanitized parameters
 */
function sanitizeQueryParams(params, defaults = {}) {
  const sanitized = { ...defaults };

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

module.exports = {
  generateQuery,
  getOffset,
  buildPagination,
  buildSearchFilter,
  buildSortOptions,
  buildDateRangeFilter,
  buildSelectOptions,
  sanitizeQueryParams,
}; 