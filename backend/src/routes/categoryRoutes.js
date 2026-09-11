const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { nameRequiredValidator, idParamValidator } = require('../validators/simpleEntityValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getCategories);
router.get('/:id', idParamValidator, validate, getCategoryById);
router.post('/', authorize('admin', 'manager'), nameRequiredValidator, validate, createCategory);
router.put('/:id', authorize('admin', 'manager'), idParamValidator, validate, updateCategory);
router.delete('/:id', authorize('admin'), idParamValidator, validate, deleteCategory);

module.exports = router;
