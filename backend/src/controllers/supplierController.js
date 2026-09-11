const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/suppliers
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });

  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$supplier', productCount: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.productCount]));

  const enriched = suppliers.map((s) => ({ ...s.toObject(), productCount: countMap.get(s._id.toString()) || 0 }));
  sendSuccess(res, 200, enriched);
});

// GET /api/suppliers/:id
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found');

  const products = await Product.find({ supplier: supplier._id, isActive: true }).populate('category location');
  sendSuccess(res, 200, { supplier, products });
});

// POST /api/suppliers
const createSupplier = asyncHandler(async (req, res) => {
  const existing = await Supplier.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
  if (existing) throw ApiError.conflict(`Supplier '${req.body.name}' already exists`);
  const supplier = await Supplier.create(req.body);
  sendSuccess(res, 201, supplier);
});

// PUT /api/suppliers/:id
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found');
  Object.assign(supplier, req.body);
  await supplier.save();
  sendSuccess(res, 200, supplier);
});

// DELETE /api/suppliers/:id
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found');

  const productCount = await Product.countDocuments({ supplier: supplier._id, isActive: true });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete supplier '${supplier.name}': ${productCount} product(s) are still linked to it.`
    );
  }

  await supplier.deleteOne();
  sendSuccess(res, 200, { message: 'Supplier deleted successfully' });
});

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
