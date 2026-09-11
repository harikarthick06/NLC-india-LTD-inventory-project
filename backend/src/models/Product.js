const mongoose = require('mongoose');

const STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'overstock'];
const UNITS = ['pcs', 'box', 'kg', 'litre', 'meter', 'set', 'pair', 'roll'];

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: '' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, required: true, default: 10, min: 0 },
    maxStockLevel: { type: Number, required: true, default: 500, min: 0 },
    unit: { type: String, enum: UNITS, default: 'pcs' },
    unitPrice: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: STATUSES, default: 'in_stock' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ location: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ status: 1 });

productSchema.virtual('totalValue').get(function totalValue() {
  return Math.round(this.quantity * this.unitPrice * 100) / 100;
});

productSchema.methods.computeStatus = function computeStatus() {
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity < this.minStockLevel) return 'low_stock';
  if (this.quantity > this.maxStockLevel) return 'overstock';
  return 'in_stock';
};

productSchema.pre('save', function syncStatus(next) {
  this.status = this.computeStatus();
  next();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
module.exports.STATUSES = STATUSES;
module.exports.UNITS = UNITS;
