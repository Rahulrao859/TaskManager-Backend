const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [1, 'Title cannot be empty'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        status: {
            type: String,
            enum: {
                values: ['todo', 'in-progress', 'done'],
                message: 'Status must be todo, in-progress, or done',
            },
            default: 'todo',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Index for efficient querying
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, title: 'text' });

module.exports = mongoose.model('Task', taskSchema);
