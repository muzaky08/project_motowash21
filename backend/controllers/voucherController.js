const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

exports.getActiveVouchers = async (req, res, next) => {
  try {
    const [vouchers] = await db.execute(
      'SELECT * FROM vouchers WHERE active = true AND valid_until > NOW() AND (max_usage = 0 OR current_usage < max_usage)'
    );
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};

exports.createVoucher = async (req, res, next) => {
  const { code, title, description, discount_type, discount_value, valid_from, valid_until, max_usage } = req.body;
  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO vouchers (id, code, title, description, discount_type, discount_value, valid_from, valid_until, max_usage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, code, title, description, discount_type, discount_value, valid_from, valid_until, max_usage || 0]
    );
    res.status(201).json({ id, code, title });
  } catch (err) {
    next(err);
  }
};
