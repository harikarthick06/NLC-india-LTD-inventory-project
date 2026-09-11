const express = require('express');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const {
  nameRequiredValidator,
  idParamValidator,
  emailOptionalValidator,
} = require('../validators/simpleEntityValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getSuppliers);
router.get('/:id', idParamValidator, validate, getSupplierById);
router.post(
  '/',
  authorize('admin', 'manager'),
  [...nameRequiredValidator, ...emailOptionalValidator],
  validate,
  createSupplier
);
router.put('/:id', authorize('admin', 'manager'), idParamValidator, validate, updateSupplier);
router.delete('/:id', authorize('admin'), idParamValidator, validate, deleteSupplier);

module.exports = router;
