const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.put('/ai-config', auth, userController.updateAIConfig);
router.get('/all', adminAuth, userController.getAllUsers);

module.exports = router;
