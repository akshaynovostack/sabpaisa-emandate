const Joi = require('joi');
const {status: httpStatus} = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

const createPermission = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(50),
    description: Joi.string().max(500),
  }),
};

const getPermissions = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().required(),
  }),
};

const updatePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(50),
      description: Joi.string().max(500),
    })
    .min(1),
};

const deletePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().required(),
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
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
  validate,
}; 