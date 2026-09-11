const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { sendSuccess } = require('../utils/apiResponse');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  // Only allow self-registration as staff; elevated roles are granted by an admin later.
  const user = await User.create({ name, email, password, role: role === 'admin' ? 'staff' : role || 'staff' });

  const token = generateToken(user);
  sendSuccess(res, 201, { user: user.toSafeObject(), token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  sendSuccess(res, 200, { user: user.toSafeObject(), token });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toSafeObject() });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: logout is handled client-side by discarding the token.
  sendSuccess(res, 200, { message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, logout };
