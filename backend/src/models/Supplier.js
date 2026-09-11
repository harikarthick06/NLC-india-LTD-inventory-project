const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    contactPerson: { type: String, trim: true, default: '' },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

supplierSchema.index({ name: 'text', contactPerson: 'text' });

module.exports = mongoose.model('Supplier', supplierSchema);
