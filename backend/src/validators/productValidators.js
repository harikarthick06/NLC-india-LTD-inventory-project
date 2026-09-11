const { body, param } = require('express-validator');
const { UNITS } = require('../models/Product');

const createProductValidator = [
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').isMongoId().withMessage('A valid category is required'),
  body('supplier').isMongoId().withMessage('A valid supplier is required'),
  body('location').isMongoId().withMessage('A valid location is required'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a non-negative number'),
  body('minStockLevel').optional().isFloat({ min: 0 }),
  body('maxStockLevel').optional().isFloat({ min: 0 }),
  body('unit').optional().isIn(UNITS).withMessage(`Unit must be one of: ${UNITS.join(', ')}`),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
];

const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product id'),
  body('category').optional().isMongoId(),
  body('supplier').optional().isMongoId(),
  body('location').optional().isMongoId(),
  body('quantity').optional().isFloat({ min: 0 }),
  body('minStockLevel').optional().isFloat({ min: 0 }),
  body('maxStockLevel').optional().isFloat({ min: 0 }),
  body('unit').optional().isIn(UNITS),
  body('unitPrice').optional().isFloat({ min: 0 }),
];

const productIdValidator = [param('id').isMongoId().withMessage('Invalid product id')];

module.exports = { createProductValidator, updateProductValidator, productIdValidator };
