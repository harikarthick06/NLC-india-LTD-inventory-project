const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
