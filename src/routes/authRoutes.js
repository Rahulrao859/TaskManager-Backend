const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/rules');
const { handleValidationErrors } = require('../middleware/validate');

router.post('/register', registerRules, handleValidationErrors, register);
router.post('/login', loginRules, handleValidationErrors, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
