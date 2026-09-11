const InventoryTransaction = require('../models/InventoryTransaction');
const inventoryService = require('../services/inventoryService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// POST /api/inventory/stock-in
const stockIn = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, referenceNumber } = req.body;
  const result = await inventoryService.moveStock({
    productId,
    quantity: Number(quantity),
    type: 'STOCK_IN',
    userId: req.user._id,
    reason,
    referenceNumber,
  });
  sendSuccess(res, 201, result);
});

// POST /api/inventory/stock-out
const stockOut = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, referenceNumber } = req.body;
  const result = await inventoryService.moveStock({
    productId,
    quantity: Number(quantity),
    type: 'STOCK_OUT',
    userId: req.user._id,
    reason,
    referenceNumber,
  });
  sendSuccess(res, 201, result);
});

// POST /api/inventory/return
const stockReturn = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, referenceNumber } = req.body;
  const result = await inventoryService.moveStock({
    productId,
    quantity: Number(quantity),
    type: 'RETURN',
    userId: req.user._id,
    reason,
    referenceNumber,
  });
  sendSuccess(res, 201, result);
});

// POST /api/inventory/adjust
const adjust = asyncHandler(async (req, res) => {
  const { productId, newQuantity, reason } = req.body;
  const result = await inventoryService.adjustStock({
    productId,
    newQuantity: Number(newQuantity),
    userId: req.user._id,
    reason,
  });
  sendSuccess(res, 200, result);
});

// GET /api/inventory/transactions?type=&page=&limit=&startDate=&endDate=
const getTransactions = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 20, startDate, endDate } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [transactions, total] = await Promise.all([
    InventoryTransaction.find(filter)
      .populate('product', 'sku name unit')
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    InventoryTransaction.countDocuments(filter),
  ]);

  sendSuccess(res, 200, transactions, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// GET /api/inventory/transactions/:productId
const getTransactionsByProduct = asyncHandler(async (req, res) => {
  const transactions = await InventoryTransaction.find({ product: req.params.productId })
    .populate('user', 'name role')
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, transactions);
});

module.exports = { stockIn, stockOut, stockReturn, adjust, getTransactions, getTransactionsByProduct };
