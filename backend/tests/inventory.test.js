const { app, request, createUserAndLogin, createProduct } = require('./helpers');

describe('Inventory stock operations', () => {
  it('increases quantity on stock-in and records a transaction', async () => {
    const { token, user } = await createUserAndLogin({ email: 'staffin@example.com', role: 'staff' });
    const product = await createProduct({ quantity: 100 });

    const res = await request(app)
      .post('/api/inventory/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 50, reason: 'Purchase order received' });

    expect(res.status).toBe(201);
    expect(res.body.data.product.quantity).toBe(150);
    expect(res.body.data.transaction.type).toBe('STOCK_IN');
    expect(res.body.data.transaction.previousQuantity).toBe(100);
    expect(res.body.data.transaction.newQuantity).toBe(150);
  });

  it('decreases quantity on stock-out and records a transaction', async () => {
    const { token } = await createUserAndLogin({ email: 'staffout@example.com', role: 'staff' });
    const product = await createProduct({ quantity: 150 });

    const res = await request(app)
      .post('/api/inventory/stock-out')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 20, reason: 'Issued to workshop' });

    expect(res.status).toBe(201);
    expect(res.body.data.product.quantity).toBe(130);
    expect(res.body.data.transaction.type).toBe('STOCK_OUT');
  });

  it('prevents stock from going negative', async () => {
    const { token } = await createUserAndLogin({ email: 'staffneg@example.com', role: 'staff' });
    const product = await createProduct({ quantity: 10 });

    const res = await request(app)
      .post('/api/inventory/stock-out')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 999 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient/i);
  });

  it('rejects zero or negative quantities at the validation layer', async () => {
    const { token } = await createUserAndLogin({ email: 'staffzero@example.com', role: 'staff' });
    const product = await createProduct({ quantity: 10 });

    const res = await request(app)
      .post('/api/inventory/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 0 });

    expect(res.status).toBe(400);
  });

  it('supports manual adjustment by a manager', async () => {
    const { token } = await createUserAndLogin({ email: 'mgradj@example.com', role: 'manager' });
    const product = await createProduct({ quantity: 100 });

    const res = await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, newQuantity: 80, reason: 'Physical count correction' });

    expect(res.status).toBe(200);
    expect(res.body.data.product.quantity).toBe(80);
    expect(res.body.data.transaction.type).toBe('ADJUSTMENT');
  });

  it('rejects adjustment by staff (manager/admin only)', async () => {
    const { token } = await createUserAndLogin({ email: 'staffadj@example.com', role: 'staff' });
    const product = await createProduct({ quantity: 100 });

    const res = await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, newQuantity: 80 });

    expect(res.status).toBe(403);
  });

  it('lists transactions with pagination', async () => {
    const { token } = await createUserAndLogin({ email: 'staffhist@example.com', role: 'staff' });
    const product = await createProduct({ quantity: 100 });

    await request(app)
      .post('/api/inventory/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 10 });

    const res = await request(app).get('/api/inventory/transactions').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });
});
