require('dotenv').config();
const express = require('express');
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
    console.warn('\x1b[33m[SECURITY WARNING] JWT_SECRET is using a default/weak value.\x1b[0m');
}
if (!process.env.ENCRYPTION_KEY || WEAK_ENC_KEYS.includes(process.env.ENCRYPTION_KEY)) {
    console.warn('\x1b[33m[SECURITY WARNING] ENCRYPTION_KEY is using a default/weak value.\x1b[0m');
}

const app = express();

// Allowed origins: localhost for dev + any deployed frontend from CLIENT_URL env var
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
];
if (process.env.CLIENT_URL) {
    ALLOWED_ORIGINS.push(process.env.CLIENT_URL);
}

// ── CORS must be the VERY FIRST middleware ─────────────────────────────────
// Handles preflight (OPTIONS) and injects CORS headers on every response.
// Placed before Helmet so nothing can strip or block these headers.
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Non-browser requests (Postman, server-to-server) – allow through
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // Respond immediately to preflight and stop processing
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Security headers (crossOriginResourcePolicy set to cross-origin for API use)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

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
