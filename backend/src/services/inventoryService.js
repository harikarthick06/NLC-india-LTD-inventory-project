const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const ApiError = require('../utils/ApiError');

/**
 * All stock mutations flow through here so that every quantity change is
 * paired with an InventoryTransaction audit record and stock never goes negative.
 *
 * Note: this intentionally avoids Mongo multi-document transactions (which require
 * a replica set) so the app works against a plain standalone MongoDB instance.
 * The quantity change itself is done with a single atomic findOneAndUpdate guarded
 * by the current quantity, so concurrent STOCK_OUT requests cannot drive stock negative.
 */
async function moveStock({ productId, quantity, type, userId, reason = '', referenceNumber = '' }) {
  if (!['STOCK_IN', 'STOCK_OUT', 'RETURN'].includes(type)) {
    throw ApiError.badRequest('Invalid transaction type for moveStock');
  }
  if (!quantity || quantity <= 0) {
    throw ApiError.badRequest('Quantity must be greater than zero');
  }

  const existing = await Product.findById(productId);
  if (!existing) throw ApiError.notFound('Product not found');

  const previousQuantity = existing.quantity;
  let updated;

  if (type === 'STOCK_OUT') {
    updated = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!updated) {
      throw ApiError.badRequest(
        `Insufficient stock: only ${existing.quantity} unit(s) of '${existing.name}' available`
      );
    }
  } else {
    updated = await Product.findByIdAndUpdate(
      productId,
      { $inc: { quantity } },
      { new: true }
    );
  }

  // Recompute derived status now that quantity has changed.
  updated.status = updated.computeStatus();
  await updated.save();

  const transaction = await InventoryTransaction.create({
    product: updated._id,
    type,
    quantity,
    previousQuantity,
    newQuantity: updated.quantity,
    user: userId,
    reason,
    referenceNumber,
  });

  const populatedTransaction = await InventoryTransaction.findById(transaction._id)
    .populate('product', 'sku name unit')
    .populate('user', 'name email role');
  const product = await Product.findById(productId).populate('category supplier location');

  return { transaction: populatedTransaction, product };
}

async function adjustStock({ productId, newQuantity, userId, reason = '' }) {
  if (newQuantity === undefined || newQuantity === null || newQuantity < 0) {
    throw ApiError.badRequest('newQuantity must be a non-negative number');
  }

  const existing = await Product.findById(productId);
  if (!existing) throw ApiError.notFound('Product not found');

  const previousQuantity = existing.quantity;
  const diff = newQuantity - previousQuantity;
  if (diff === 0) {
    throw ApiError.badRequest('New quantity is the same as current quantity');
  }

  existing.quantity = newQuantity;
  existing.status = existing.computeStatus();
  await existing.save();

  const transaction = await InventoryTransaction.create({
    product: existing._id,
    type: 'ADJUSTMENT',
    quantity: Math.abs(diff),
    previousQuantity,
    newQuantity,
    user: userId,
    reason: reason || `Manual adjustment (${diff > 0 ? '+' : ''}${diff})`,
  });

  const populatedTransaction = await InventoryTransaction.findById(transaction._id)
    .populate('product', 'sku name unit')
    .populate('user', 'name email role');
  const product = await Product.findById(productId).populate('category supplier location');

  return { transaction: populatedTransaction, product };
}

module.exports = { moveStock, adjustStock };
