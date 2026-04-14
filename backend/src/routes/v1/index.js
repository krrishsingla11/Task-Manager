const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/tasks', require('./tasks'));
router.use('/admin', require('./admin'));

module.exports = router;
