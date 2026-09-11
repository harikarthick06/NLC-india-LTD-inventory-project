const { createProduct } = require('./helpers');
const tools = require('../src/ai/inventoryTools');

describe('AI inventory tools (read-only)', () => {
  it('getLowStockProducts only returns products below their min level', async () => {
    await createProduct({ sku: 'LOW-1', quantity: 2, minStockLevel: 10 });
    await createProduct({ sku: 'OK-1', quantity: 50, minStockLevel: 10 });

    const result = await tools.getLowStockProducts({});
    expect(result.count).toBe(1);
    expect(result.products[0].sku).toBe('LOW-1');
  });

  it('getOutOfStockProducts only returns zero-quantity products', async () => {
    await createProduct({ sku: 'OUT-1', quantity: 0 });
    await createProduct({ sku: 'IN-1', quantity: 10 });

    const result = await tools.getOutOfStockProducts({});
    expect(result.count).toBe(1);
    expect(result.products[0].sku).toBe('OUT-1');
  });

  it('getInventoryValue computes quantity x unitPrice across products', async () => {
    await createProduct({ sku: 'VAL-1', quantity: 10, unitPrice: 5 });
    await createProduct({ sku: 'VAL-2', quantity: 4, unitPrice: 25 });

    const result = await tools.getInventoryValue({});
    expect(result.totalValue).toBe(150);
  });

  it('getProductByName is case-insensitive and partial-match', async () => {
    await createProduct({ sku: 'BRG-9', name: 'Deep Groove Ball Bearing' });
    const result = await tools.getProductByName({ name: 'bearing' });
    expect(result.count).toBe(1);
  });

  it('unknown tool names never touch the database - only declared tools exist', () => {
    expect(tools.deleteProduct).toBeUndefined();
    expect(tools.dropDatabase).toBeUndefined();
  });
});
