const Joi = require('joi');

const createRolePermission = {
  body: Joi.object().keys({
    role_id: Joi.number().integer().required(),
    permission_id: Joi.string().uuid().required(),
  }),
};

const getRolePermissions = {
  query: Joi.object().keys({
    role_id: Joi.number().integer(),
    permission_id: Joi.string().uuid(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

const getRolePermission = {
  params: Joi.object().keys({
    rolePermissionId: Joi.string().uuid().required(),
  }),
};

const updateRolePermission = {
  params: Joi.object().keys({
    rolePermissionId: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    role_id: Joi.number().integer(),
    permission_id: Joi.string().uuid(),
  }).min(1),
};

const deleteRolePermission = {
  params: Joi.object().keys({
    rolePermissionId: Joi.string().uuid().required(),
  }),
};

module.exports = {
  createRolePermission,
  getRolePermissions,
  getRolePermission,
  updateRolePermission,
  deleteRolePermission,
}; 