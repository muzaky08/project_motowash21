const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, transactionController.createBooking);
router.get('/user', auth, transactionController.getUserBookings);
router.get('/all', adminAuth, transactionController.getAllBookings);
router.patch('/:id/status', adminAuth, transactionController.updateBookingStatus);

module.exports = router;
