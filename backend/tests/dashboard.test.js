const { app, request, createUserAndLogin, createProduct } = require('./helpers');

describe('Dashboard API', () => {
  it('returns real aggregated summary data, not hardcoded values', async () => {
    const { token } = await createUserAndLogin({ email: 'dash1@example.com', role: 'manager' });
    await createProduct({ sku: 'D-1', quantity: 100, unitPrice: 10, minStockLevel: 5, maxStockLevel: 200 });
    await createProduct({ sku: 'D-2', quantity: 0, unitPrice: 50, minStockLevel: 5, maxStockLevel: 200 });

    const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalProducts).toBe(2);
    expect(res.body.data.totalValue).toBe(1000);
    expect(res.body.data.outOfStockCount).toBe(1);
  });

  it('returns category stats grouped correctly', async () => {
    const { token } = await createUserAndLogin({ email: 'dash2@example.com', role: 'manager' });
    await createProduct({ sku: 'D-3', quantity: 10, unitPrice: 5 });

    const res = await request(app).get('/api/dashboard/category-stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].totalValue).toBe(50);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });
});
