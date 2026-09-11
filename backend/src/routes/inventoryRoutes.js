const express = require('express');
const {
  stockIn,
  stockOut,
  stockReturn,
  adjust,
  getTransactions,
  getTransactionsByProduct,
} = require('../controllers/inventoryController');
const {
  stockMoveValidator,
  adjustValidator,
  productParamValidator,
} = require('../validators/inventoryValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.post('/stock-in', authorize('admin', 'manager', 'staff'), stockMoveValidator, validate, stockIn);
router.post('/stock-out', authorize('admin', 'manager', 'staff'), stockMoveValidator, validate, stockOut);
router.post('/return', authorize('admin', 'manager', 'staff'), stockMoveValidator, validate, stockReturn);
router.post('/adjust', authorize('admin', 'manager'), adjustValidator, validate, adjust);
router.get('/transactions', getTransactions);
router.get('/transactions/:productId', productParamValidator, validate, getTransactionsByProduct);

module.exports = router;
