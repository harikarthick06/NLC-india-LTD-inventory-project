/**
 * Read-only inventory query functions exposed to the Claude AI assistant as "tools".
 *
 * SECURITY: this is the ONLY surface Claude can touch. Every function here is:
 *  - read-only (no create/update/delete of any kind)
 *  - scoped to inventory data only (never users, passwords, tokens, env vars)
 *  - bounded (limits are clamped so a single call cannot dump the whole database)
 *
 * Claude never sees a database connection, a Mongoose model, or raw query syntax -
 * it can only call these named functions with the arguments declared in
 * `toolDefinitions.js`, and only the JSON these functions return is sent back to it.
 */
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Location = require('../models/Location');
const InventoryTransaction = require('../models/InventoryTransaction');

const MAX_LIMIT = 25;
const clampLimit = (limit, fallback = 10) => {
  const n = Number(limit) || fallback;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
};

const PRODUCT_SUMMARY_FIELDS =
  'sku name quantity unit unitPrice minStockLevel maxStockLevel status category supplier location updatedAt';

function toProductSummary(p) {
  return {
    sku: p.sku,
    name: p.name,
    quantity: p.quantity,
    unit: p.unit,
    unitPrice: p.unitPrice,
    totalValue: Math.round(p.quantity * p.unitPrice * 100) / 100,
    status: p.status,
    minStockLevel: p.minStockLevel,
    maxStockLevel: p.maxStockLevel,
    category: p.category && p.category.name ? p.category.name : undefined,
    supplier: p.supplier && p.supplier.name ? p.supplier.name : undefined,
    location: p.location && p.location.name ? p.location.name : undefined,
    updatedAt: p.updatedAt,
  };
}

async function getProductByName({ name }) {
  if (!name) return { error: 'name is required' };
  const products = await Product.find({ name: new RegExp(escapeRegex(name), 'i'), isActive: true })
    .populate('category', 'name')
    .populate('supplier', 'name')
    .populate('location', 'name')
    .limit(MAX_LIMIT)
    .lean();
  return { count: products.length, products: products.map(toProductSummary) };
}

async function searchProducts({ query, category, location, supplier, status, limit } = {}) {
  const filter = { isActive: true };
  if (query) filter.$text = { $search: query };
  if (status) filter.status = status;

  if (category) {
    const cat = await Category.findOne({ name: new RegExp(escapeRegex(category), 'i') }).lean();
    if (cat) filter.category = cat._id;
    else return { count: 0, products: [], note: `No category matching '${category}'` };
  }
  if (location) {
    const loc = await Location.findOne({ name: new RegExp(escapeRegex(location), 'i') }).lean();
    if (loc) filter.location = loc._id;
    else return { count: 0, products: [], note: `No location matching '${location}'` };
  }
  if (supplier) {
    const sup = await Supplier.findOne({ name: new RegExp(escapeRegex(supplier), 'i') }).lean();
    if (sup) filter.supplier = sup._id;
    else return { count: 0, products: [], note: `No supplier matching '${supplier}'` };
  }

  const products = await Product.find(filter)
    .select(PRODUCT_SUMMARY_FIELDS)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .populate('location', 'name')
    .limit(clampLimit(limit))
    .lean();

  return { count: products.length, products: products.map(toProductSummary) };
}

async function getLowStockProducts({ limit } = {}) {
  const products = await Product.find({ status: 'low_stock', isActive: true })
    .select(PRODUCT_SUMMARY_FIELDS)
    .populate('category', 'name')
    .populate('location', 'name')
    .sort({ quantity: 1 })
    .limit(clampLimit(limit))
    .lean();
  return { count: products.length, products: products.map(toProductSummary) };
}

async function getOutOfStockProducts({ limit } = {}) {
  const products = await Product.find({ status: 'out_of_stock', isActive: true })
    .select(PRODUCT_SUMMARY_FIELDS)
    .populate('category', 'name')
    .populate('location', 'name')
    .sort({ updatedAt: -1 })
    .limit(clampLimit(limit))
    .lean();
  return { count: products.length, products: products.map(toProductSummary) };
}

async function getInventoryByCategory({ categoryName } = {}) {
  const match = { isActive: true };
  if (categoryName) {
    const cat = await Category.findOne({ name: new RegExp(escapeRegex(categoryName), 'i') }).lean();
    if (!cat) return { note: `No category matching '${categoryName}'`, results: [] };
    match.category = cat._id;
  }

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

  return { results };
}

async function getInventoryByLocation({ locationName } = {}) {
  const match = { isActive: true };
  if (locationName) {
    const loc = await Location.findOne({ name: new RegExp(escapeRegex(locationName), 'i') }).lean();
    if (!loc) return { note: `No location matching '${locationName}'`, results: [] };
    match.location = loc._id;
  }

  const results = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$location',
        productCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
    { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
    { $unwind: '$location' },
    { $sort: { totalValue: -1 } },
    {
      $project: {
        _id: 0,
        location: '$location.name',
        productCount: 1,
        totalQuantity: 1,
        totalValue: { $round: ['$totalValue', 2] },
      },
    },
  ]);

  if (locationName) {
    const products = await Product.find({ ...match })
      .select(PRODUCT_SUMMARY_FIELDS)
      .populate('category', 'name')
      .populate('location', 'name')
      .limit(MAX_LIMIT)
      .lean();
    return { results, products: products.map(toProductSummary) };
  }

  return { results };
}

async function getInventoryValue({ categoryName } = {}) {
  const match = { isActive: true };
  if (categoryName) {
    const cat = await Category.findOne({ name: new RegExp(escapeRegex(categoryName), 'i') }).lean();
    if (!cat) return { note: `No category matching '${categoryName}'` };
    match.category = cat._id;
  }

  const [agg] = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
  ]);

  return {
    scope: categoryName || 'all inventory',
    totalProducts: agg?.totalProducts || 0,
    totalQuantity: agg?.totalQuantity || 0,
    totalValue: Math.round((agg?.totalValue || 0) * 100) / 100,
  };
}

async function getRecentTransactions({ limit, type } = {}) {
  const filter = {};
  if (type) filter.type = type;
  const transactions = await InventoryTransaction.find(filter)
    .populate('product', 'sku name unit')
    .populate('user', 'name role')
    .sort({ createdAt: -1 })
    .limit(clampLimit(limit))
    .lean();

  return {
    count: transactions.length,
    transactions: transactions.map((t) => ({
      type: t.type,
      product: t.product?.name,
      sku: t.product?.sku,
      quantity: t.quantity,
      previousQuantity: t.previousQuantity,
      newQuantity: t.newQuantity,
      user: t.user?.name,
      reason: t.reason,
      date: t.createdAt,
    })),
  };
}

async function getStockMovement({ days, productName } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - (Number(days) || 30));

  const match = { createdAt: { $gte: since } };
  if (productName) {
    const products = await Product.find({ name: new RegExp(escapeRegex(productName), 'i') })
      .select('_id')
      .lean();
    if (!products.length) return { note: `No product matching '${productName}'` };
    match.product = { $in: products.map((p) => p._id) };
  }

  const results = await InventoryTransaction.aggregate([
    { $match: match },
    { $group: { _id: '$type', totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } },
    { $project: { _id: 0, type: '$_id', totalQuantity: 1, count: 1 } },
  ]);

  return { periodDays: Number(days) || 30, scope: productName || 'all products', movement: results };
}

async function getTopMovingProducts({ days, limit } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - (Number(days) || 30));

  const results = await InventoryTransaction.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$product', totalMovement: { $sum: '$quantity' }, transactionCount: { $sum: 1 } } },
    { $sort: { totalMovement: -1 } },
    { $limit: clampLimit(limit) },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        product: '$product.name',
        sku: '$product.sku',
        totalMovement: 1,
        transactionCount: 1,
      },
    },
  ]);

  return { periodDays: Number(days) || 30, results };
}

async function getProductsBySupplier({ supplierName } = {}) {
  if (!supplierName) return { error: 'supplierName is required' };
  const supplier = await Supplier.findOne({ name: new RegExp(escapeRegex(supplierName), 'i') }).lean();
  if (!supplier) return { note: `No supplier matching '${supplierName}'`, products: [] };

  const products = await Product.find({ supplier: supplier._id, isActive: true })
    .select(PRODUCT_SUMMARY_FIELDS)
    .populate('category', 'name')
    .populate('location', 'name')
    .limit(MAX_LIMIT)
    .lean();

  return { supplier: supplier.name, count: products.length, products: products.map(toProductSummary) };
}

async function getRecentlyAddedProducts({ days } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - (Number(days) || 7));

  const products = await Product.find({ createdAt: { $gte: since }, isActive: true })
    .select(PRODUCT_SUMMARY_FIELDS)
    .populate('category', 'name')
    .populate('location', 'name')
    .sort({ createdAt: -1 })
    .limit(MAX_LIMIT)
    .lean();

  return { periodDays: Number(days) || 7, count: products.length, products: products.map(toProductSummary) };
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  getProductByName,
  searchProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventoryByCategory,
  getInventoryByLocation,
  getInventoryValue,
  getRecentTransactions,
  getStockMovement,
  getTopMovingProducts,
  getProductsBySupplier,
  getRecentlyAddedProducts,
};
