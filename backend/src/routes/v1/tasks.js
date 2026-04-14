const express = require('express');
const router = express.Router();
const {
  getAllTasks, getTask, createTask, updateTask, deleteTask,
} = require('../../controllers/taskController');
const authenticate = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createTaskValidator, updateTaskValidator } = require('../../validators/taskValidator');

// All task routes require authentication
router.use(authenticate);

router.get('/', getAllTasks);
router.get('/:id', getTask);
router.post('/', createTaskValidator, validate, createTask);
router.put('/:id', updateTaskValidator, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
