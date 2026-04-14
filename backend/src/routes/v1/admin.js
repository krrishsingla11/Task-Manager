const express = require('express');
const router = express.Router();
const {
  listUsers, updateUserRole, deactivateUser, getStats,
} = require('../../controllers/adminController');
const authenticate = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/roleGuard');

// All admin routes require authentication + admin role
router.use(authenticate, roleGuard('admin'));

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/deactivate', deactivateUser);
router.get('/stats', getStats);

module.exports = router;
