const User = require('../models/User');
const Task = require('../models/Task');
const { success, error } = require('../utils/response');

// GET /api/v1/admin/users
const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return success(res, {
      users: users.map((u) => u.toPublic()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return error(res, 'Role must be "user" or "admin".', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return error(res, 'User not found.', 404);

    return success(res, user.toPublic(), `User role updated to ${role}`);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/admin/users/:id/deactivate
const deactivateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return error(res, 'Cannot deactivate yourself.', 400);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return error(res, 'User not found.', 404);
    return success(res, user.toPublic(), 'User deactivated');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, tasksByStatus] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = { todo: 0, 'in-progress': 0, done: 0 };
    tasksByStatus.forEach(({ _id, count }) => { statusMap[_id] = count; });

    return success(res, { totalUsers, totalTasks, tasksByStatus: statusMap });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUserRole, deactivateUser, getStats };
