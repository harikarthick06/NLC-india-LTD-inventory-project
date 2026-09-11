const { app, request, createUserAndLogin, createProduct } = require('./helpers');
const Category = require('../src/models/Category');

describe('Category management', () => {
  it('creates a category', async () => {
    const { token } = await createUserAndLogin({ email: 'cat1@example.com', role: 'admin' });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bearings' });
    expect(res.status).toBe(201);
  });

  it('prevents deleting a category that still has products', async () => {
    const { token } = await createUserAndLogin({ email: 'cat2@example.com', role: 'admin' });
    const product = await createProduct({ sku: 'CAT-1' });

    const res = await request(app)
      .delete(`/api/categories/${product.category}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/still assigned/i);

    const stillExists = await Category.findById(product.category);
    expect(stillExists).not.toBeNull();
  });
});
