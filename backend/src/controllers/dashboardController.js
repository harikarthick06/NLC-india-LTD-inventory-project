const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/dashboard/summary
const getSummary = asyncHandler(async (req, res) => {
  const [totals] = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
  ]);

  const [lowStockCount, outOfStockCount, overstockCount] = await Promise.all([
    Product.countDocuments({ status: 'low_stock', isActive: true }),
    Product.countDocuments({ status: 'out_of_stock', isActive: true }),
    Product.countDocuments({ status: 'overstock', isActive: true }),
  ]);

  const recentTransactions = await InventoryTransaction.find()
    .populate('product', 'sku name unit')
    .populate('user', 'name role')
    .sort({ createdAt: -1 })
    .limit(10);

  const recentStockIn = await InventoryTransaction.find({ type: 'STOCK_IN' })
    .populate('product', 'sku name unit')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentStockOut = await InventoryTransaction.find({ type: 'STOCK_OUT' })
    .populate('product', 'sku name unit')
    .sort({ createdAt: -1 })
    .limit(5);

  sendSuccess(res, 200, {
    totalProducts: totals?.totalProducts || 0,
    totalQuantity: totals?.totalQuantity || 0,
    totalValue: Math.round((totals?.totalValue || 0) * 100) / 100,
    lowStockCount,
    outOfStockCount,
    overstockCount,
    recentTransactions,
    recentStockIn,
    recentStockOut,
  });
});

// GET /api/dashboard/category-stats
const getCategoryStats = asyncHandler(async (req, res) => {
  const results = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $sort: { totalValue: -1 } },
    {
      $project: {
        _id: 0,
        categoryId: '$category._id',
        category: '$category.name',
        productCount: 1,
        totalQuantity: 1,
        totalValue: { $round: ['$totalValue', 2] },
      },
    },
  ]);

  sendSuccess(res, 200, results);
});

// GET /api/dashboard/stock-movement?days=30
const getStockMovement = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 90);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const results = await InventoryTransaction.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' },
        totalQuantity: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  const byDate = new Map();
  for (const r of results) {
    const date = r._id.date;
    if (!byDate.has(date)) byDate.set(date, { date, STOCK_IN: 0, STOCK_OUT: 0, ADJUSTMENT: 0, RETURN: 0 });
    byDate.get(date)[r._id.type] = r.totalQuantity;
  }

  // Fill in missing days so the chart has a continuous timeline.
  const series = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push(byDate.get(key) || { date: key, STOCK_IN: 0, STOCK_OUT: 0, ADJUSTMENT: 0, RETURN: 0 });
  }

  sendSuccess(res, 200, series);
});

module.exports = { getSummary, getCategoryStats, getStockMovement };
