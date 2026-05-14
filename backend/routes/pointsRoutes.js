const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { auth } = require('../middleware/auth');

router.get('/', auth, pointsController.getUserPoints);

module.exports = router;
