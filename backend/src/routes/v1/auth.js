const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../../controllers/authController');
const authenticate = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { registerValidator, loginValidator } = require('../../validators/authValidator');

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', authenticate, getMe);

module.exports = router;
