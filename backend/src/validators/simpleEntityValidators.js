const { body, param } = require('express-validator');

const nameRequiredValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid id')];

const emailOptionalValidator = [
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Must be a valid email'),
];

module.exports = { nameRequiredValidator, idParamValidator, emailOptionalValidator };
