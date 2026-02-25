const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskRules } = require('../middleware/rules');
const { handleValidationErrors } = require('../middleware/validate');

// All task routes are protected
router.use(protect);

router.route('/')
    .get(getTasks)
    .post(taskRules, handleValidationErrors, createTask);

router.route('/:id')
    .get(getTask)
    .put(taskRules, handleValidationErrors, updateTask)
    .delete(deleteTask);

module.exports = router;
