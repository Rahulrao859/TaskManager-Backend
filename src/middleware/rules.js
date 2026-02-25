const { body } = require('express-validator');

const registerRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters')
        .escape(), // prevent XSS via HTML-entity encoding

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

const taskRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
        .escape(),

    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
];

// For PUT (partial updates) — all fields are optional
const updateTaskRules = [
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title cannot be empty')
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
        .escape(),

    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
];

module.exports = { registerRules, loginRules, taskRules, updateTaskRules };
