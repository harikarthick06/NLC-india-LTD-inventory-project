const { body, param } = require('express-validator');

const stockMoveValidator = [
  body('productId').isMongoId().withMessage('A valid productId is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be a positive number'),
  body('reason').optional().trim().isLength({ max: 300 }),
  body('referenceNumber').optional().trim().isLength({ max: 100 }),
];

const adjustValidator = [
  body('productId').isMongoId().withMessage('A valid productId is required'),
  body('newQuantity').isFloat({ min: 0 }).withMessage('newQuantity must be a non-negative number'),
  body('reason').optional().trim().isLength({ max: 300 }),
];

const productParamValidator = [param('productId').isMongoId().withMessage('Invalid product id')];

module.exports = { stockMoveValidator, adjustValidator, productParamValidator };
