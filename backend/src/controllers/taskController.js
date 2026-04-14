const Task = require('../models/Task');
const { success, error } = require('../utils/response');

/** Build query filter based on user's role */
const buildFilter = (req) => {
  const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  return filter;
};

// GET /api/v1/tasks
const getAllTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const filter = buildFilter(req);
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('owner', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return success(res, {
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user._id };

    const task = await Task.findOne(filter).populate('owner', 'name email');
    if (!task) return error(res, 'Task not found.', 404);

    return success(res, task);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/tasks
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user._id });
    return success(res, task, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user._id };

    const task = await Task.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email');

    if (!task) return error(res, 'Task not found or unauthorized.', 404);
    return success(res, task, 'Task updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user._id };

    const task = await Task.findOneAndDelete(filter);
    if (!task) return error(res, 'Task not found or unauthorized.', 404);

    return success(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTasks, getTask, createTask, updateTask, deleteTask };
