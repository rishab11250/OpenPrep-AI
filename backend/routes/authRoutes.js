const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyEmail,
  resetPassword,
  refreshToken,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
} = require('../middleware/validators');

const router = express.Router();

// Skip rate limiting in test environment
const shouldSkip = () => process.env.NODE_ENV === 'test';

// Reusable rate limiter factory
const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    skip: shouldSkip,
    message: {
      success: false,
      error: message,
    },
    standardHeaders: true,
    legacyHeaders: true,
  });

// Login rate limiter: 5 attempts per 15 minutes per IP
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

// Register rate limiter: 5 attempts per 15 minutes per IP
const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts. Please try again after 15 minutes.',
});

// Forgot password rate limiter: 5 attempts per hour per IP
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please try again after an hour.',
});

// Refresh token rate limiter: 10 attempts per 15 minutes per IP
const refreshTokenLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many refresh requests. Please try again later.',
});

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.post('/verify-email/:token', verifyEmail);
router.post('/refresh-token', refreshTokenLimiter, validateRefreshToken, refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;