const mongoose = require('mongoose');

const TRANSACTION_TYPES = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN'];

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    quantity: { type: Number, required: true, min: 1 },
    previousQuantity: { type: Number, required: true, min: 0 },
    newQuantity: { type: Number, required: true, min: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true, default: '' },
    referenceNumber: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1, createdAt: -1 });
inventoryTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
