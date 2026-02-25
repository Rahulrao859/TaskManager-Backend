require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

// Connect to MongoDB
connectDB();

// Warn if default/weak secrets are being used
const WEAK_JWT_SECRETS = ['your_super_secret_jwt_key_here', 'rahulrao1234_supersecret'];
const WEAK_ENC_KEYS = ['your_32_character_encryption_key_', 'changethis32charkey1234567890123', 'default_32_char_key_replace_this!'];
if (!process.env.JWT_SECRET || WEAK_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
    console.warn('\x1b[33m[SECURITY WARNING] JWT_SECRET is using a default/weak value. Please set a strong secret in your .env file.\x1b[0m');
}
if (!process.env.ENCRYPTION_KEY || WEAK_ENC_KEYS.includes(process.env.ENCRYPTION_KEY)) {
    console.warn('\x1b[33m[SECURITY WARNING] ENCRYPTION_KEY is using a default/weak value. Please set a strong 32-char key in your .env file.\x1b[0m');
}

const app = express();

// Security headers
app.use(helmet());

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS - allow frontend origin with credentials
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
