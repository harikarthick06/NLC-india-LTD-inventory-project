const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} = require('../validators/productValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProducts);
router.get('/:id', productIdValidator, validate, getProductById);
router.post('/', authorize('admin', 'manager'), createProductValidator, validate, createProduct);
router.put('/:id', authorize('admin', 'manager'), updateProductValidator, validate, updateProduct);
router.delete('/:id', authorize('admin'), productIdValidator, validate, deleteProduct);

module.exports = router;
