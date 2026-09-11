const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { idParamValidator } = require('../validators/simpleEntityValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.put('/:id', idParamValidator, validate, updateUser);
router.delete('/:id', idParamValidator, validate, deleteUser);

module.exports = router;
