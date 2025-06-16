const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().required().email(),
    mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
    telephone: Joi.string().pattern(/^[0-9]{10}$/),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    mobile: Joi.string(),
    search: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100),
      email: Joi.string().email(),
      mobile: Joi.string().pattern(/^[0-9]{10}$/),
      pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
      telephone: Joi.string().pattern(/^[0-9]{10}$/),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
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
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  validate,
}; 