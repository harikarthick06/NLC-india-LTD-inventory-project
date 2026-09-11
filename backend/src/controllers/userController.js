const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, users.map((u) => u.toSafeObject()));
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const { name, role, isActive } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  if (user._id.equals(req.user._id) && isActive === false) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  await user.save();
  sendSuccess(res, 200, user.toSafeObject());
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  await user.deleteOne();
  sendSuccess(res, 200, { message: 'User deleted successfully' });
});

module.exports = { getUsers, updateUser, deleteUser };
