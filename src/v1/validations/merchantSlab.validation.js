const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

// Common validation rules for amounts
const amountValidation = Joi.string().pattern(/^\d+(\.\d{1,2})?$/).required();
const numberValidation = Joi.number().integer().positive().required();

const createMerchantSlab = {
  body: Joi.object().keys({
    merchant_id: Joi.string().required(),
    slab_from: amountValidation,
    slab_to: amountValidation,
    base_amount: amountValidation,
    emi_amount: Joi.string().pattern(/^-?\d+(\.\d{1,2})?$/).required(),
    emi_tenure: numberValidation,
    duration: numberValidation,
    processing_fee: amountValidation,
    frequency: Joi.string().valid('BIMN', 'DAIL', 'MNTH', 'QURT', 'MIAN', 'WEEK', 'YEAR').required(),
    mandate_category: Joi.string().valid('A001', 'B001', 'D001', 'E001', 'I002', 'I001', 'L002', 'L001', 'M001', 'U099').required(),
    status: Joi.number().valid(0, 1).default(1),
    is_active: Joi.boolean().default(true),
    effective_date: Joi.date().iso().required(),
    expiry_date: Joi.date().iso().min(Joi.ref('effective_date')).required(),
    remarks: Joi.string().allow('', null),
  }),
};

const getMerchantSlabs = {
  query: Joi.object().keys({
    merchant_id: Joi.string(),
    frequency: Joi.string().valid('BIMN', 'DAIL', 'MNTH', 'QURT', 'MIAN', 'WEEK', 'YEAR'),
    mandate_category: Joi.string().valid('A001', 'B001', 'D001', 'E001', 'I002', 'I001', 'L002', 'L001', 'M001', 'U099'),
    status: Joi.number().valid(0, 1),
    is_active: Joi.boolean(),
    amount_range: Joi.object().keys({
      min: Joi.number().positive(),
      max: Joi.number().positive().min(Joi.ref('min')),
    }),
    date_range: Joi.object().keys({
      start: Joi.date().iso(),
      end: Joi.date().iso().min(Joi.ref('start')),
    }),
    search: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getMerchantSlab = {
  params: Joi.object().keys({
    merchantId: Joi.string().required(),
    slabId: Joi.string().required(),
  }),
};

const updateMerchantSlab = {
  params: Joi.object().keys({
    merchantId: Joi.string().required(),
    slabId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      slab_from: amountValidation,
      slab_to: amountValidation,
      base_amount: amountValidation,
      emi_amount: Joi.string().pattern(/^-?\d+(\.\d{1,2})?$/),
      emi_tenure: numberValidation,
      duration: numberValidation,
      processing_fee: amountValidation,
      frequency: Joi.string().valid('BIMN', 'DAIL', 'MNTH', 'QURT', 'MIAN', 'WEEK', 'YEAR'),
      mandate_category: Joi.string().valid('A001', 'B001', 'D001', 'E001', 'I002', 'I001', 'L002', 'L001', 'M001', 'U099'),
      status: Joi.number().valid(0, 1),
      is_active: Joi.boolean(),
      effective_date: Joi.date().iso(),
      expiry_date: Joi.date().iso().min(Joi.ref('effective_date')),
      remarks: Joi.string().allow('', null),
    })
    .min(1),
};

const deleteMerchantSlab = {
  params: Joi.object().keys({
    merchantId: Joi.string().required(),
    slabId: Joi.string().required(),
  }),
};

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = {
  createMerchantSlab,
  getMerchantSlabs,
  getMerchantSlab,
  updateMerchantSlab,
  deleteMerchantSlab,
  validate,
}; 