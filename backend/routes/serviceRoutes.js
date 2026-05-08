const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { adminAuth } = require('../middleware/auth');

router.get('/', serviceController.getAllServices);
router.post('/', adminAuth, serviceController.createService);

module.exports = router;
