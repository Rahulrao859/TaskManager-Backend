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
const { taskRules, updateTaskRules } = require('../middleware/rules');
const { handleValidationErrors } = require('../middleware/validate');
const { decryptRequest, encryptResponse } = require('../middleware/encryption');

// All task routes are protected
router.use(protect);

router.route('/')
    // GET: list all tasks — encrypt the response payload
    .get(encryptResponse, getTasks)
    // POST: create task — decrypt incoming payload, validate, then create
    .post(decryptRequest, taskRules, handleValidationErrors, encryptResponse, createTask);

router.route('/:id')
    // GET: single task — encrypt the response payload
    .get(encryptResponse, getTask)
    // PUT: partial update — decrypt payload, use optional-field rules, then update
    .put(decryptRequest, updateTaskRules, handleValidationErrors, encryptResponse, updateTask)
    // DELETE: no payload encryption needed
    .delete(deleteTask);

module.exports = router;
