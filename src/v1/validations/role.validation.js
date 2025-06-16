const Joi = require('joi');

const createRole = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
  }),
};

const getRoles = {
  query: Joi.object().keys({
    limit: Joi.number().min(1),
    page: Joi.number().min(1),
    search: Joi.string(),
  }),
};

const getRole = {
  params: Joi.object().keys({
    roleId: Joi.number().required(),
  }),
};

const updateRole = {
  params: Joi.object().keys({
    roleId: Joi.number().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
    })
    .min(1),
};

const deleteRole = {
  params: Joi.object().keys({
    roleId: Joi.number().required(),
  }),
};

module.exports = {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
}; 