const express = require('express');
const { chat, chatValidator } = require('../controllers/aiController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.use(protect);

router.post('/chat', aiLimiter, chatValidator, validate, chat);

module.exports = router;
