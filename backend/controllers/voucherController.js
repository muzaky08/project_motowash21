const db = require('../db/db');

exports.validateVoucher = async (req, res, next) => {
  const { code, amount } = req.body;

  try {
    const [vouchers] = await db.execute(
      'SELECT * FROM vouchers WHERE code = ? AND is_active = true',
      [code]
    );

    if (vouchers.length === 0) {
      return res.status(400).json({ success: false, message: 'Voucher tidak ditemukan atau tidak aktif' });
    }

    const voucher = vouchers[0];
    const now = new Date();

    if (now < new Date(voucher.valid_from) || now > new Date(voucher.valid_until)) {
      return res.status(400).json({ success: false, message: 'Voucher sudah kedaluwarsa atau belum berlaku' });
    }

    if (voucher.used_count >= voucher.quota) {
      return res.status(400).json({ success: false, message: 'Kuota voucher sudah habis' });
    }

    if (amount < voucher.min_order) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimal transaksi untuk voucher ini adalah Rp ${Number(voucher.min_order).toLocaleString('id-ID')}` 
      });
    }

    let discountAmount = 0;
    if (voucher.type === 'percent') {
      discountAmount = (amount * voucher.value) / 100;
    } else {
      discountAmount = voucher.value;
    }

    res.json({ 
      success: true, 
      data: { 
        code: voucher.code, 
        discount_amount: discountAmount,
        type: voucher.type,
        value: voucher.value
      },
      message: 'Voucher berhasil diterapkan' 
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminVouchers = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM vouchers ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getActiveVouchers = async (req, res, next) => {
  try {
    // Show all vouchers that are active and haven't expired yet
    const [rows] = await db.execute(
      'SELECT * FROM vouchers WHERE is_active = true AND valid_until >= NOW() AND used_count < quota ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.createVoucher = async (req, res, next) => {
  const { code, title, description, type, value, min_order, quota, valid_from, valid_until } = req.body;

  try {
    await db.execute(
      'INSERT INTO vouchers (code, title, description, type, value, min_order, quota, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, title, description, type, value, min_order || 0, quota, valid_from, valid_until]
    );
    res.status(201).json({ success: true, message: 'Voucher berhasil dibuat' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Kode voucher sudah ada' });
    }
    next(err);
  }
};

exports.updateVoucher = async (req, res, next) => {
  const { id } = req.params;
  const { code, title, description, type, value, min_order, quota, valid_from, valid_until, is_active } = req.body;

  try {
    await db.execute(
      'UPDATE vouchers SET code = ?, title = ?, description = ?, type = ?, value = ?, min_order = ?, quota = ?, valid_from = ?, valid_until = ?, is_active = ? WHERE id = ?',
      [code, title, description, type, value, min_order, quota, valid_from, valid_until, is_active, id]
    );
    res.json({ success: true, message: 'Voucher berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
};

exports.deactivateVoucher = async (req, res, next) => {
  const { id } = req.params;

  try {
    await db.execute('UPDATE vouchers SET is_active = false WHERE id = ?', [id]);
    res.json({ success: true, message: 'Voucher berhasil dinonaktifkan' });
  } catch (err) {
    next(err);
  }
};
