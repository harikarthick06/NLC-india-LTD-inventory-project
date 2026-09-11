const express = require('express');
const {
  inventorySummary,
  lowStockReport,
  outOfStockReport,
  valuationReport,
  categoryReport,
  supplierReport,
  stockMovementReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/inventory-summary', inventorySummary);
router.get('/low-stock', lowStockReport);
router.get('/out-of-stock', outOfStockReport);
router.get('/valuation', valuationReport);
router.get('/category', categoryReport);
router.get('/supplier', supplierReport);
router.get('/stock-movement', stockMovementReport);

module.exports = router;
