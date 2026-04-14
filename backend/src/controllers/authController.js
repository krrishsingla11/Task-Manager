const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/** Generate a signed JWT for a user */
const signToken = (userId) =>
  jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return error(res, 'Email already in use.', 409);
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    logger.info(`New user registered: ${email}`);
    return success(res, { token, user: user.toPublic() }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return error(res, 'Invalid credentials.', 401);
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return error(res, 'Invalid credentials.', 401);
    }

    const token = signToken(user._id);

    logger.info(`User logged in: ${email}`);
    return success(res, { token, user: user.toPublic() }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
const getMe = async (req, res) => {
  return success(res, req.user.toPublic(), 'Current user');
};

module.exports = { register, login, getMe };
