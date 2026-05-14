const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { auth, adminAuth } = require('../middleware/auth');

// Public/User routes
router.get('/active', voucherController.getActiveVouchers);
router.post('/validate', auth, voucherController.validateVoucher);

// Admin routes
router.get('/admin', adminAuth, voucherController.getAdminVouchers);
router.post('/admin', adminAuth, voucherController.createVoucher);
router.put('/admin/:id', adminAuth, voucherController.updateVoucher);
router.delete('/admin/:id', adminAuth, voucherController.deactivateVoucher);

module.exports = router;
