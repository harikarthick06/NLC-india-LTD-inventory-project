const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { sendCsv } = require('../utils/csv');

function buildProductFilter(query) {
  const { category, supplier, location, status } = query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;
  if (location) filter.location = location;
  if (status) filter.status = status;
  return filter;
}

const PRODUCT_CSV_COLUMNS = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'location', label: 'Location' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'minStockLevel', label: 'Min Level' },
  { key: 'unitPrice', label: 'Unit Price' },
  { key: 'totalValue', label: 'Total Value' },
  { key: 'status', label: 'Status' },
];

function flattenProduct(p) {
  return {
    sku: p.sku,
    name: p.name,
    category: p.category?.name || '',
    supplier: p.supplier?.name || '',
    location: p.location?.name || '',
    quantity: p.quantity,
    minStockLevel: p.minStockLevel,
    unitPrice: p.unitPrice,
    totalValue: Math.round(p.quantity * p.unitPrice * 100) / 100,
    status: p.status,
  };
}

async function fetchFilteredProducts(query, extraFilter = {}) {
  const filter = { ...buildProductFilter(query), ...extraFilter };
  return Product.find(filter).populate('category', 'name').populate('supplier', 'name').populate('location', 'name');
}

// GET /api/reports/inventory-summary
const inventorySummary = asyncHandler(async (req, res) => {
  const products = await fetchFilteredProducts(req.query);
  const rows = products.map(flattenProduct);

  if (req.query.format === 'csv') {
    return sendCsv(res, 'inventory-summary.csv', rows, PRODUCT_CSV_COLUMNS);
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalProducts += 1;
      acc.totalQuantity += r.quantity;
      acc.totalValue += r.totalValue;
      return acc;
    },
    { totalProducts: 0, totalQuantity: 0, totalValue: 0 }
  );
  totals.totalValue = Math.round(totals.totalValue * 100) / 100;

  sendSuccess(res, 200, { totals, products: rows });
});

// GET /api/reports/low-stock
const lowStockReport = asyncHandler(async (req, res) => {
  const products = await fetchFilteredProducts(req.query, { status: 'low_stock' });
  const rows = products.map(flattenProduct);
  if (req.query.format === 'csv') return sendCsv(res, 'low-stock-report.csv', rows, PRODUCT_CSV_COLUMNS);
  sendSuccess(res, 200, rows);
});

// GET /api/reports/out-of-stock
const outOfStockReport = asyncHandler(async (req, res) => {
  const products = await fetchFilteredProducts(req.query, { status: 'out_of_stock' });
  const rows = products.map(flattenProduct);
  if (req.query.format === 'csv') return sendCsv(res, 'out-of-stock-report.csv', rows, PRODUCT_CSV_COLUMNS);
  sendSuccess(res, 200, rows);
});

// GET /api/reports/valuation
const valuationReport = asyncHandler(async (req, res) => {
  const products = await fetchFilteredProducts(req.query);
  const rows = products.map(flattenProduct).sort((a, b) => b.totalValue - a.totalValue);
  if (req.query.format === 'csv') return sendCsv(res, 'inventory-valuation.csv', rows, PRODUCT_CSV_COLUMNS);
  const totalValue = Math.round(rows.reduce((sum, r) => sum + r.totalValue, 0) * 100) / 100;
  sendSuccess(res, 200, { totalValue, products: rows });
});

// GET /api/reports/category
const categoryReport = asyncHandler(async (req, res) => {
  const match = { isActive: true };
  if (req.query.category) match.category = new (require('mongoose').Types.ObjectId)(req.query.category);

  const results = await Product.aggregate([
    { $match: match },
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
        category: '$category.name',
        productCount: 1,
        totalQuantity: 1,
        totalValue: { $round: ['$totalValue', 2] },
      },
    },
  ]);

  if (req.query.format === 'csv') {
    return sendCsv(res, 'category-report.csv', results, [
      { key: 'category', label: 'Category' },
      { key: 'productCount', label: 'Product Count' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'totalValue', label: 'Total Value' },
    ]);
  }
  sendSuccess(res, 200, results);
});

// GET /api/reports/supplier
const supplierReport = asyncHandler(async (req, res) => {
  const match = { isActive: true };
  if (req.query.supplier) match.supplier = new (require('mongoose').Types.ObjectId)(req.query.supplier);

  const results = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$supplier',
        productCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
    { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
    { $unwind: '$supplier' },
    { $sort: { totalValue: -1 } },
    {
      $project: {
        _id: 0,
        supplier: '$supplier.name',
        productCount: 1,
        totalQuantity: 1,
        totalValue: { $round: ['$totalValue', 2] },
      },
    },
  ]);

  if (req.query.format === 'csv') {
    return sendCsv(res, 'supplier-report.csv', results, [
      { key: 'supplier', label: 'Supplier' },
      { key: 'productCount', label: 'Product Count' },
      { key: 'totalQuantity', label: 'Total Quantity' },
      { key: 'totalValue', label: 'Total Value' },
    ]);
  }
  sendSuccess(res, 200, results);
});

// GET /api/reports/stock-movement?startDate=&endDate=
const stockMovementReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const transactions = await InventoryTransaction.find(match)
    .populate('product', 'sku name unit')
    .populate('user', 'name role')
    .sort({ createdAt: -1 })
    .limit(1000);

  const rows = transactions.map((t) => ({
    date: t.createdAt.toISOString(),
    type: t.type,
    sku: t.product?.sku || '',
    product: t.product?.name || '',
    quantity: t.quantity,
    previousQuantity: t.previousQuantity,
    newQuantity: t.newQuantity,
    user: t.user?.name || '',
    reason: t.reason,
    referenceNumber: t.referenceNumber,
  }));

  if (req.query.format === 'csv') {
    return sendCsv(res, 'stock-movement-report.csv', rows, [
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'sku', label: 'SKU' },
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'previousQuantity', label: 'Previous Qty' },
      { key: 'newQuantity', label: 'New Qty' },
      { key: 'user', label: 'User' },
      { key: 'reason', label: 'Reason' },
      { key: 'referenceNumber', label: 'Reference' },
    ]);
  }
  sendSuccess(res, 200, rows);
});

module.exports = {
  inventorySummary,
  lowStockReport,
  outOfStockReport,
  valuationReport,
  categoryReport,
  supplierReport,
  stockMovementReport,
};
