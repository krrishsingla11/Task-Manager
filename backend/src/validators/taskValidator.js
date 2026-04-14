const { body } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description max 500 characters')
    .escape(),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601)'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description max 500 characters')
    .escape(),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601)'),
];

module.exports = { createTaskValidator, updateTaskValidator };
