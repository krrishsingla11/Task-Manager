const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Middleware that checks express-validator results
 * and returns 422 if any validation errors exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(
      res,
      'Validation failed',
      422,
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = validate;
