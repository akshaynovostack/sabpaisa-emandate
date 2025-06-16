const {status: httpStatus} = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { permissionService } = require('../../services');
const pick = require('../../utils/pick');
const { success } = require('../../utils/response');
const ApiError = require('../../utils/ApiError');

const createPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);
  return success(res, {
    message: 'Permission created successfully',
    data: { permission },
    meta: {
      createdAt: permission.created_at,
      updatedAt: permission.updated_at
    }
  }, httpStatus.CREATED);
});

const getPermissions = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, name } = req.query;
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await permissionService.getAllPermissions(filter, options);

  return success(res, {
    message: 'Permissions retrieved successfully',
    data: {
      permissions: result.permissions,
      pagination: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(result.total / limit),
      }
    },
    meta: {
      totalCount: result.total,
      currentPage: Number(page),
      totalPages: Math.ceil(result.total / limit)
    }
  });
});

const getPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.getPermissionById(req.params.permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  
  return success(res, {
    message: 'Permission retrieved successfully',
    data: { permission }
  });
});

const updatePermission = catchAsync(async (req, res) => {
  const permission = await permissionService.updatePermissionById(req.params.permissionId, req.body);
  return success(res, {
    message: 'Permission updated successfully',
    data: { permission },
    meta: {
      updatedAt: permission.updated_at
    }
  });
});

const deletePermission = catchAsync(async (req, res) => {
  const permission = await permissionService.deletePermissionById(req.params.permissionId);
  return success(res, {
    message: 'Permission deleted successfully',
    data: { id: req.params.permissionId },
    meta: {
      deletedAt: new Date().toISOString()
    }
  });
});

module.exports = {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
}; 