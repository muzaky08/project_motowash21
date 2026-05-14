const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

router.post('/', auth, reviewController.createReview);
router.get('/', reviewController.getServiceReviews);

module.exports = router;
