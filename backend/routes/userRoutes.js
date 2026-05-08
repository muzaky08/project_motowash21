const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

router.put('/profile', auth, userController.updateProfile);
router.get('/all', adminAuth, userController.getAllUsers);

module.exports = router;
