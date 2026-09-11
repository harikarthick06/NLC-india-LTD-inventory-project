const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { chatWithAssistant } = require('../services/claudeService');

const chatValidator = [
  body('message').trim().notEmpty().withMessage('message is required').isLength({ max: 1000 }),
  body('history').optional().isArray({ max: 20 }),
];

// POST /api/ai/chat
const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  const sanitizedHistory = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  const result = await chatWithAssistant(message, sanitizedHistory);
  sendSuccess(res, 200, result);
});

module.exports = { chat, chatValidator };
