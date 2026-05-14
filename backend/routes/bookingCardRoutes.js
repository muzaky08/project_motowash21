const express = require('express');
const router = express.Router();
const bookingCardController = require('../controllers/bookingCardController');
const { auth, adminAuth } = require('../middleware/auth');

// User routes
router.get('/', auth, bookingCardController.getUserCards);
router.get('/:code', auth, bookingCardController.getCardDetail);

// Admin routes
router.post('/validate', adminAuth, bookingCardController.validateBookingCard);

module.exports = router;
