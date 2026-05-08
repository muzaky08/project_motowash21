const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { auth } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').not().isEmpty().withMessage('Name is required')
  ],
  authController.register
);

router.post('/login', authLimiter, authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
