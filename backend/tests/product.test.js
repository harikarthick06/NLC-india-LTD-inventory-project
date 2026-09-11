const { app, request, createUserAndLogin, createBaseEntities } = require('./helpers');

describe('Product CRUD', () => {
  it('allows a manager to create a product and computes status', async () => {
    const { token } = await createUserAndLogin({ email: 'mgr1@example.com', role: 'manager' });
    const { category, supplier, location } = await createBaseEntities();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sku: 'ABC-001',
        name: 'Widget',
        category: category._id,
        supplier: supplier._id,
        location: location._id,
        quantity: 5,
        minStockLevel: 10,
        maxStockLevel: 100,
        unitPrice: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('low_stock');
    expect(res.body.data.totalValue).toBe(100);
  });

  it('rejects a staff user from creating a product', async () => {
    const { token } = await createUserAndLogin({ email: 'staff1@example.com', role: 'staff' });
    const { category, supplier, location } = await createBaseEntities();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'X-1', name: 'X', category: category._id, supplier: supplier._id, location: location._id, unitPrice: 5 });

    expect(res.status).toBe(403);
  });

  it('rejects duplicate SKUs', async () => {
    const { token } = await createUserAndLogin({ email: 'mgr2@example.com', role: 'manager' });
    const { category, supplier, location } = await createBaseEntities();
    const payload = {
      sku: 'DUP-001',
      name: 'Dup Item',
      category: category._id,
      supplier: supplier._id,
      location: location._id,
      unitPrice: 10,
    };

    await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(payload);
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(409);
  });

  it('lists and searches products', async () => {
    const { token } = await createUserAndLogin({ email: 'mgr3@example.com', role: 'manager' });
    const { category, supplier, location } = await createBaseEntities();
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'BRG-100', name: 'Bearing Deluxe', category: category._id, supplier: supplier._id, location: location._id, quantity: 20, unitPrice: 15 });

    const res = await request(app).get('/api/products?search=bearing').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('only allows admin to delete a product', async () => {
    const { token: mgrToken } = await createUserAndLogin({ email: 'mgr4@example.com', role: 'manager' });
    const { token: adminToken } = await createUserAndLogin({ email: 'admin1@example.com', role: 'admin' });
    const { category, supplier, location } = await createBaseEntities();

    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({ sku: 'DEL-001', name: 'Deletable', category: category._id, supplier: supplier._id, location: location._id, unitPrice: 1 });

    const forbidden = await request(app)
      .delete(`/api/products/${create.body.data._id}`)
      .set('Authorization', `Bearer ${mgrToken}`);
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .delete(`/api/products/${create.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(allowed.status).toBe(200);
  });
});
