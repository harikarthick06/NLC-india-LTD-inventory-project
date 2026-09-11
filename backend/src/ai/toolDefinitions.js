/**
 * Anthropic tool-use schema for the inventory assistant.
 * Each entry maps 1:1 to a function in `inventoryTools.js`. Claude can only
 * request these named, read-only operations - it never gets raw DB access.
 */
const toolDefinitions = [
  {
    name: 'getProductByName',
    description: 'Look up one or more products by (partial) product name and return their current stock, price and status.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Full or partial product name, e.g. "bearing"' } },
      required: ['name'],
    },
  },
  {
    name: 'searchProducts',
    description: 'Search/filter products by free-text query, category, location, supplier and/or stock status. Use for general "show me products where..." questions.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text search across product name/SKU/brand' },
        category: { type: 'string', description: 'Category name filter' },
        location: { type: 'string', description: 'Location name filter' },
        supplier: { type: 'string', description: 'Supplier name filter' },
        status: {
          type: 'string',
          enum: ['in_stock', 'low_stock', 'out_of_stock', 'overstock'],
          description: 'Stock status filter',
        },
        limit: { type: 'number', description: 'Max results to return (default 10, max 25)' },
      },
    },
  },
  {
    name: 'getLowStockProducts',
    description: 'Get products whose quantity has fallen below their minimum stock level.',
    input_schema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max results (default 10, max 25)' } },
    },
  },
  {
    name: 'getOutOfStockProducts',
    description: 'Get products that currently have zero quantity in stock.',
    input_schema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max results (default 10, max 25)' } },
    },
  },
  {
    name: 'getInventoryByCategory',
    description: 'Get aggregated inventory stats (product count, total quantity, total value) grouped by category, or for one named category.',
    input_schema: {
      type: 'object',
      properties: { categoryName: { type: 'string', description: 'Optional: a specific category name' } },
    },
  },
  {
    name: 'getInventoryByLocation',
    description: 'Get aggregated inventory stats grouped by location, or the product list for one named location (e.g. "Warehouse A").',
    input_schema: {
      type: 'object',
      properties: { locationName: { type: 'string', description: 'Optional: a specific location name' } },
    },
  },
  {
    name: 'getInventoryValue',
    description: 'Get the total inventory value (quantity x unit price), optionally scoped to one category.',
    input_schema: {
      type: 'object',
      properties: { categoryName: { type: 'string', description: 'Optional: restrict to this category' } },
    },
  },
  {
    name: 'getRecentTransactions',
    description: 'Get the most recent stock transactions (stock in/out/adjustment/return) across all products.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 10, max 25)' },
        type: { type: 'string', enum: ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN'] },
      },
    },
  },
  {
    name: 'getStockMovement',
    description: 'Get total stock IN vs stock OUT movement over a recent period, overall or for one product.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to look back (default 30)' },
        productName: { type: 'string', description: 'Optional: restrict to one product' },
      },
    },
  },
  {
    name: 'getTopMovingProducts',
    description: 'Get the products with the highest total stock movement (in + out) over a recent period.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to look back (default 30)' },
        limit: { type: 'number', description: 'Max results (default 10, max 25)' },
      },
    },
  },
  {
    name: 'getProductsBySupplier',
    description: 'Get all products supplied by a named supplier.',
    input_schema: {
      type: 'object',
      properties: { supplierName: { type: 'string', description: 'Supplier name, e.g. "ABC Industries"' } },
      required: ['supplierName'],
    },
  },
  {
    name: 'getRecentlyAddedProducts',
    description: 'Get products that were added to the catalog within a recent number of days.',
    input_schema: {
      type: 'object',
      properties: { days: { type: 'number', description: 'Number of days to look back (default 7)' } },
    },
  },
];

module.exports = toolDefinitions;
