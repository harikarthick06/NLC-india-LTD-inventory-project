const express = require('express');
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');
const { nameRequiredValidator, idParamValidator } = require('../validators/simpleEntityValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getLocations);
router.get('/:id', idParamValidator, validate, getLocationById);
router.post('/', authorize('admin', 'manager'), nameRequiredValidator, validate, createLocation);
router.put('/:id', authorize('admin', 'manager'), idParamValidator, validate, updateLocation);
router.delete('/:id', authorize('admin'), idParamValidator, validate, deleteLocation);

module.exports = router;
