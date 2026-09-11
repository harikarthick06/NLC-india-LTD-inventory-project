const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
  skip: () => env.IS_TEST,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.AI_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests, please slow down.' },
  skip: () => env.IS_TEST,
});

module.exports = { authLimiter, aiLimiter };
