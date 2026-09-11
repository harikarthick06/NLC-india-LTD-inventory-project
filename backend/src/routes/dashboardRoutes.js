const express = require('express');
const { getSummary, getCategoryStats, getStockMovement } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/category-stats', getCategoryStats);
router.get('/stock-movement', getStockMovement);

module.exports = router;
