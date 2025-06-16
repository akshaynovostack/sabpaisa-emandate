const Joi = require('joi');
const { password } = require('./custom.validation');

const createTeam = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    mobile: Joi.string().required().pattern(/^[0-9]{10}$/).messages({
      'string.pattern.base': 'Mobile number must be 10 digits',
    }),
    description: Joi.string().allow('', null),
    role_id: Joi.number().required(),
  }),
};

const getTeams = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/),
    role_id: Joi.number(),
    search: Joi.string(),
    limit: Joi.number().min(1).max(100),
    page: Joi.number().min(1),
  }),
};

const getTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().uuid().required(),
  }),
};

const updateTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string().min(2).max(100),
      mobile: Joi.string().pattern(/^[0-9]{10}$/).messages({
        'string.pattern.base': 'Mobile number must be 10 digits',
      }),
      description: Joi.string().allow('', null),
      role_id: Joi.number().integer(),
    })
    .min(1),
};

const deleteTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().uuid().required(),
  }),
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
}; 