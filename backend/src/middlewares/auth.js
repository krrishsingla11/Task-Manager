const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');
const { error } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    let token;

    // Support Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return error(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return error(res, 'User not found or deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired. Please log in again.', 401);
    }
    return error(res, 'Invalid token.', 401);
  }
};

module.exports = authenticate;
