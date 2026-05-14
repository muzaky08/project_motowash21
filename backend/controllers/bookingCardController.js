const db = require('../db/db');

exports.getUserCards = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT bc.*, b.service, b.date, b.time, b.name, b.phone
       FROM booking_cards bc
       JOIN bookings b ON bc.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY bc.generated_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getCardDetail = async (req, res, next) => {
  const { code } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT bc.*, b.service, b.date, b.time, b.name, b.phone, b.bike_size, b.status as booking_status
       FROM booking_cards bc
       JOIN bookings b ON bc.booking_id = b.id
       WHERE bc.card_code = ?`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kartu booking tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.validateBookingCard = async (req, res, next) => {
  const { code } = req.body;
  const admin_id = req.user.id;

  try {
    const [cards] = await db.execute(
      'SELECT bc.*, b.user_id, b.id as booking_id FROM booking_cards bc JOIN bookings b ON bc.booking_id = b.id WHERE bc.card_code = ?',
      [code]
    );

    if (cards.length === 0) {
      return res.status(404).json({ success: false, message: 'Kode kartu tidak valid' });
    }

    const card = cards[0];

    if (card.status === 'validated') {
      return res.status(400).json({ success: false, message: 'Kartu sudah pernah divalidasi' });
    }

    if (card.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Kartu sudah kedaluwarsa' });
    }

    // 1. Update card status and mark the related booking as completed.
    await db.execute(
      'UPDATE booking_cards SET status = "validated", validated_at = NOW(), validated_by = ? WHERE id = ?',
      [admin_id, card.id]
    );
    await db.execute('UPDATE bookings SET status = "Selesai" WHERE id = ?', [card.booking_id]);

    // 2. Add completion points once.
    const points = 10;
    const [existing] = await db.execute(
      'SELECT id FROM loyalty_points WHERE user_id = ? AND booking_id = ? AND reason = ?',
      [card.user_id, card.booking_id, 'service_complete']
    );

    if (existing.length === 0) {
      await db.execute(
        'INSERT INTO loyalty_points (user_id, booking_id, points, reason) VALUES (?, ?, ?, ?)',
        [card.user_id, card.booking_id, points, 'service_complete']
      );
      await db.execute(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?',
        [points, card.user_id]
      );
    }

    res.json({ 
      success: true, 
      message: 'Kartu berhasil divalidasi, +20 poin ditambahkan ke user',
      data: { points_added: points }
    });
  } catch (err) {
    next(err);
  }
};
