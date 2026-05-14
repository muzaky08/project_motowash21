const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', galleryController.getGallery);

// Admin only routes
router.post('/', adminAuth, galleryController.addGallery);
router.put('/:id', adminAuth, galleryController.updateGallery);
router.delete('/:id', adminAuth, galleryController.deleteGallery);

module.exports = router;
