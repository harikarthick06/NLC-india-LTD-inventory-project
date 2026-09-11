/* eslint-disable no-console */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Location = require('../models/Location');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const seedData = require('./seedData');

const TRANSACTION_TYPES_FOR_HISTORY = ['STOCK_IN', 'STOCK_OUT', 'RETURN', 'ADJUSTMENT'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomInt(8, 17), randomInt(0, 59), 0, 0);
  return d;
}

/**
 * Builds a plausible, internally-consistent stock movement history for one product
 * that starts at 0 and ends exactly at `target` (the seeded quantity), so the
 * transaction ledger always agrees with the product's current stock.
 */
function buildHistory(target) {
  const entries = [];
  let qty = Math.max(0, Math.round(target * (0.5 + Math.random() * 0.2)));

  entries.push({
    type: 'STOCK_IN',
    previousQuantity: 0,
    newQuantity: qty,
    daysAgo: 50,
    reason: 'Initial stock load',
  });

  const steps = randomInt(2, 5);
  for (let i = 0; i < steps; i += 1) {
    const dAgo = Math.max(1, 45 - Math.round((45 / (steps + 1)) * (i + 1)) + randomInt(-3, 3));
    const magnitude = Math.max(1, Math.round(qty * (0.05 + Math.random() * 0.2)));
    const type = TRANSACTION_TYPES_FOR_HISTORY[randomInt(0, TRANSACTION_TYPES_FOR_HISTORY.length - 1)];
    const sign = type === 'STOCK_OUT' ? -1 : 1;
    const delta = sign * magnitude;
    const newQty = Math.max(0, qty + delta);

    entries.push({
      type,
      previousQuantity: qty,
      newQuantity: newQty,
      daysAgo: dAgo,
      quantity: Math.abs(newQty - qty),
      reason:
        type === 'STOCK_IN'
          ? 'Routine purchase order receipt'
          : type === 'STOCK_OUT'
          ? 'Issued to maintenance crew'
          : type === 'RETURN'
          ? 'Returned unused material'
          : 'Physical stock count adjustment',
    });
    qty = newQty;
  }

  if (qty !== target) {
    const diff = target - qty;
    entries.push({
      type: diff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
      previousQuantity: qty,
      newQuantity: target,
      quantity: Math.abs(diff),
      daysAgo: 1,
      reason: 'Stock reconciliation after physical count',
    });
    qty = target;
  }

  return entries.map((e) => ({
    ...e,
    quantity: e.quantity || Math.abs(e.newQuantity - e.previousQuantity) || 1,
  }));
}

async function seed() {
  await connectDB();
  console.log('Connected. Wiping existing collections...');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Location.deleteMany({}),
    Product.deleteMany({}),
    InventoryTransaction.deleteMany({}),
  ]);

  if (process.argv.includes('--destroy')) {
    console.log('All collections wiped. Exiting (--destroy mode).');
    await disconnectDB();
    process.exit(0);
  }

  console.log('Seeding users...');
  const createdUsers = await User.create(seedData.users);
  const managerUser = createdUsers.find((u) => u.role === 'manager') || createdUsers[0];

  console.log('Seeding categories...');
  const createdCategories = await Category.insertMany(seedData.categories);
  const categoryByName = new Map(createdCategories.map((c) => [c.name, c]));

  console.log('Seeding suppliers...');
  const createdSuppliers = await Supplier.insertMany(seedData.suppliers);
  const supplierByName = new Map(createdSuppliers.map((s) => [s.name, s]));

  console.log('Seeding locations...');
  const createdLocations = await Location.insertMany(seedData.locations);
  const locationByName = new Map(createdLocations.map((l) => [l.name, l]));

  console.log('Seeding products...');
  let totalTransactions = 0;

  for (const p of seedData.products) {
    const category = categoryByName.get(p.category);
    const supplier = supplierByName.get(p.supplier);
    const location = locationByName.get(p.location);
    if (!category || !supplier || !location) {
      throw new Error(`Seed data references unknown category/supplier/location for ${p.sku}`);
    }

    const product = await Product.create({
      sku: p.sku,
      name: p.name,
      description: `${p.name} - ${p.subcategory || p.category} used in NLC plant maintenance operations.`,
      category: category._id,
      subcategory: p.subcategory || '',
      brand: p.brand,
      supplier: supplier._id,
      location: location._id,
      quantity: p.quantity,
      minStockLevel: p.minStockLevel,
      maxStockLevel: p.maxStockLevel,
      unit: p.unit,
      unitPrice: p.unitPrice,
    });

    const history = buildHistory(p.quantity);
    const docs = history.map((h) => ({
      product: product._id,
      type: h.type,
      quantity: h.quantity,
      previousQuantity: h.previousQuantity,
      newQuantity: h.newQuantity,
      user: createdUsers[randomInt(0, createdUsers.length - 1)]._id,
      reason: h.reason,
      referenceNumber: `PO-${randomInt(1000, 9999)}`,
      createdAt: daysAgo(h.daysAgo),
      updatedAt: daysAgo(h.daysAgo),
    }));
    await InventoryTransaction.insertMany(docs);
    totalTransactions += docs.length;
  }

  console.log('--------------------------------------------------');
  console.log('Seed complete:');
  console.log(`  Users:        ${createdUsers.length}`);
  console.log(`  Categories:   ${createdCategories.length}`);
  console.log(`  Suppliers:    ${createdSuppliers.length}`);
  console.log(`  Locations:    ${createdLocations.length}`);
  console.log(`  Products:     ${seedData.products.length}`);
  console.log(`  Transactions: ${totalTransactions}`);
  console.log('--------------------------------------------------');
  console.log('Test credentials:');
  seedData.users.forEach((u) => console.log(`  ${u.role.padEnd(8)} -> ${u.email} / ${u.password}`));
  console.log('--------------------------------------------------');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
