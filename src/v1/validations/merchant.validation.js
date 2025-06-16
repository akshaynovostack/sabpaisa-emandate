const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

const createMerchant = {
  body: Joi.object().keys({
    merchant_id: Joi.string().required(),
    name: Joi.string().required().min(3).max(100),
    merchant_code: Joi.string().required(),
    address: Joi.string(),
    status: Joi.number().integer().min(0).max(1),
  }),
};

const getMerchants = {
  query: Joi.object().keys({
    name: Joi.string(),
    merchant_id: Joi.string(),
    merchant_code: Joi.string(),
    status: Joi.number().integer().min(0).max(1),
    search: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMerchant = {
  params: Joi.object().keys({
    merchantId: Joi.string().required(),
  }),
};

const updateMerchant = {
  params: Joi.object().keys({
    merchantId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      merchant_id: Joi.string(),
      name: Joi.string().min(3).max(100),
      merchant_code: Joi.string(),
      address: Joi.string(),
      status: Joi.number().integer().min(0).max(1),
    })
    .min(1),
};

const deleteMerchant = {
  params: Joi.object().keys({
    merchantId: Joi.string().required(),
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
  createMerchant,
  getMerchants,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  validate,
}; 