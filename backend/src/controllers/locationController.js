const Location = require('../models/Location');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/locations
const getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find().sort({ name: 1 });

  const stats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$location',
        productCount: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
  ]);
  const statsMap = new Map(stats.map((s) => [s._id.toString(), s]));

  const enriched = locations.map((l) => {
    const s = statsMap.get(l._id.toString());
    return {
      ...l.toObject(),
      productCount: s?.productCount || 0,
      totalQuantity: s?.totalQuantity || 0,
      totalValue: Math.round((s?.totalValue || 0) * 100) / 100,
    };
  });

  sendSuccess(res, 200, enriched);
});

// GET /api/locations/:id
const getLocationById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw ApiError.notFound('Location not found');

  const products = await Product.find({ location: location._id, isActive: true }).populate('category supplier');
  sendSuccess(res, 200, { location, products });
});

// POST /api/locations
const createLocation = asyncHandler(async (req, res) => {
  const existing = await Location.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
  if (existing) throw ApiError.conflict(`Location '${req.body.name}' already exists`);
  const location = await Location.create(req.body);
  sendSuccess(res, 201, location);
});

// PUT /api/locations/:id
const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw ApiError.notFound('Location not found');
  Object.assign(location, req.body);
  await location.save();
  sendSuccess(res, 200, location);
});

// DELETE /api/locations/:id
const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw ApiError.notFound('Location not found');

  const productCount = await Product.countDocuments({ location: location._id, isActive: true });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete location '${location.name}': ${productCount} product(s) are still stored there.`
    );
  }

  await location.deleteOne();
  sendSuccess(res, 200, { message: 'Location deleted successfully' });
});

module.exports = { getLocations, getLocationById, createLocation, updateLocation, deleteLocation };
