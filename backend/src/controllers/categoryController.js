const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  const stats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
  ]);
  const statsMap = new Map(stats.map((s) => [s._id.toString(), s]));

  const enriched = categories.map((c) => {
    const s = statsMap.get(c._id.toString());
    return {
      ...c.toObject(),
      productCount: s?.productCount || 0,
      totalQuantity: s?.totalQuantity || 0,
      totalValue: Math.round((s?.totalValue || 0) * 100) / 100,
    };
  });

  sendSuccess(res, 200, enriched);
});

// GET /api/categories/:id
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const products = await Product.find({ category: category._id, isActive: true }).populate('supplier location');
  sendSuccess(res, 200, { category, products });
});

// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
  if (existing) throw ApiError.conflict(`Category '${req.body.name}' already exists`);
  const category = await Category.create(req.body);
  sendSuccess(res, 201, category);
});

// PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  Object.assign(category, req.body);
  await category.save();
  sendSuccess(res, 200, category);
});

// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const productCount = await Product.countDocuments({ category: category._id, isActive: true });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete category '${category.name}': ${productCount} product(s) are still assigned to it. Reassign or remove those products first.`
    );
  }

  await category.deleteOne();
  sendSuccess(res, 200, { message: 'Category deleted successfully' });
});

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
