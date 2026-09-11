const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Location = require('../models/Location');
const InventoryTransaction = require('../models/InventoryTransaction');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const SORTABLE_FIELDS = ['name', 'sku', 'quantity', 'unitPrice', 'createdAt', 'updatedAt', 'status'];

// GET /api/products?search=&category=&location=&supplier=&status=&sortBy=&sortDir=&page=&limit=
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    location,
    supplier,
    status,
    sortBy = 'createdAt',
    sortDir = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (location) filter.location = location;
  if (supplier) filter.supplier = supplier;
  if (status) filter.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  const sort = { [sortField]: sortDir === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('location', 'name')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, products, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name description')
    .populate('supplier', 'name contactPerson email phone')
    .populate('location', 'name description');
  if (!product) throw ApiError.notFound('Product not found');

  const transactions = await InventoryTransaction.find({ product: product._id })
    .populate('user', 'name role')
    .sort({ createdAt: -1 })
    .limit(50);

  sendSuccess(res, 200, { product, transactions });
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { sku, category, supplier, location } = req.body;

  const existing = await Product.findOne({ sku: sku.toUpperCase() });
  if (existing) throw ApiError.conflict(`SKU '${sku}' is already in use`);

  const [categoryDoc, supplierDoc, locationDoc] = await Promise.all([
    Category.findById(category),
    Supplier.findById(supplier),
    Location.findById(location),
  ]);
  if (!categoryDoc) throw ApiError.badRequest('Category not found');
  if (!supplierDoc) throw ApiError.badRequest('Supplier not found');
  if (!locationDoc) throw ApiError.badRequest('Location not found');

  const product = await Product.create(req.body);

  if (product.quantity > 0) {
    await InventoryTransaction.create({
      product: product._id,
      type: 'STOCK_IN',
      quantity: product.quantity,
      previousQuantity: 0,
      newQuantity: product.quantity,
      user: req.user._id,
      reason: 'Initial stock on product creation',
    });
  }

  const populated = await Product.findById(product._id).populate('category supplier location');
  sendSuccess(res, 201, populated);
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  // Quantity must go through the dedicated stock in/out/adjust endpoints so every
  // change is captured as an InventoryTransaction.
  const { quantity, ...updatable } = req.body;

  if (updatable.sku) {
    const dup = await Product.findOne({ sku: updatable.sku.toUpperCase(), _id: { $ne: product._id } });
    if (dup) throw ApiError.conflict(`SKU '${updatable.sku}' is already in use`);
  }

  Object.assign(product, updatable);
  await product.save();

  const populated = await Product.findById(product._id).populate('category supplier location');
  sendSuccess(res, 200, populated);
});

// DELETE /api/products/:id (soft delete)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  product.isActive = false;
  await product.save();

  sendSuccess(res, 200, { message: 'Product deleted successfully' });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
