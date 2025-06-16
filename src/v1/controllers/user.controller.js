const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { userService } = require('../../services');
const pick = require('../../utils/pick');
const { success } = require('../../utils/response');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  return success(res, {
    message: 'User created successfully',
    data: { user },
    meta: {
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  }, httpStatus.CREATED);
});

const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = pick(req.query, ['name', 'email', 'mobile']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'search']);
  const result = await userService.getAllUsers(filter, options);

  return success(res, {
    message: 'Users retrieved successfully',
    data: {
      users: result.users,
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

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  return success(res, {
    message: 'User retrieved successfully',
    data: { user }
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  return success(res, {
    message: 'User updated successfully',
    data: { user },
    meta: {
      updatedAt: user.updated_at
    }
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.deleteUserById(req.params.userId);
  return success(res, {
    message: 'User deleted successfully',
    data: { id: req.params.userId },
    meta: {
      deletedAt: new Date().toISOString()
    }
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
}; 