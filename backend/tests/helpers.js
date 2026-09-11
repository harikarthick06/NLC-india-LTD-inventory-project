const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Supplier = require('../src/models/Supplier');
const Location = require('../src/models/Location');
const Product = require('../src/models/Product');

async function createUserAndLogin({ name = 'Test User', email, password = 'Password1', role = 'staff' } = {}) {
  await User.create({ name, email, password, role });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.token, user: res.body.data.user };
}

let entityCounter = 0;

async function createBaseEntities() {
  entityCounter += 1;
  const category = await Category.create({ name: `Test Category ${entityCounter}` });
  const supplier = await Supplier.create({ name: `Test Supplier ${entityCounter}` });
  const location = await Location.create({ name: `Test Location ${entityCounter}` });
  return { category, supplier, location };
}

async function createProduct(overrides = {}) {
  const { category, supplier, location } = await createBaseEntities();
  return Product.create({
    sku: 'TST-001',
    name: 'Test Bearing',
    category: category._id,
    supplier: supplier._id,
    location: location._id,
    quantity: 100,
    minStockLevel: 10,
    maxStockLevel: 500,
    unitPrice: 50,
    ...overrides,
  });
}

module.exports = { createUserAndLogin, createBaseEntities, createProduct, app, request };
