const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { adminAuth } = require('../middleware/auth');

router.get('/active', voucherController.getActiveVouchers);
router.post('/', adminAuth, voucherController.createVoucher);

module.exports = router;
