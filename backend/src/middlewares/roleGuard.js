const { error } = require('../utils/response');

/**
 * Factory function that creates a role-guard middleware.
 * Usage: roleGuard('admin')  or  roleGuard('admin', 'superadmin')
 */
const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, `Access denied. Requires role: ${roles.join(' or ')}.`, 403);
    }
    next();
  };
};

module.exports = roleGuard;
