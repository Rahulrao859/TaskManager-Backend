const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user with pagination, filter, and search
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        // Build query - always scoped to the logged-in user
        const query = { user: req.user._id };

        // Filter by status
        if (status && ['todo', 'in-progress', 'done'].includes(status)) {
            query.status = status;
        }

        // Search by title (case-insensitive)
        if (search && search.trim()) {
            query.title = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [tasks, total] = await Promise.all([
            Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Task.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: tasks,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
    try {
        const { title, description, status } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            user: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
    try {
        const { title, description, status } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title, description, status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
