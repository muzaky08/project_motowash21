const db = require('../db/db');

exports.getUserPoints = async (req, res, next) => {
  try {
    const [user] = await db.execute(
      'SELECT total_points FROM users WHERE id = ?',
      [req.user.id]
    );

    const [history] = await db.execute(
      'SELECT * FROM loyalty_points WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ 
      success: true, 
      data: {
        total_points: user[0]?.total_points || 0,
        history: history
      }
    });
  } catch (err) {
    next(err);
  }
};

// Internal point addition (can be used for referrals, etc.)
exports.addPointsInternal = async (userId, points, reason, bookingId = null) => {
  try {
    await db.execute(
      'INSERT INTO loyalty_points (user_id, booking_id, points, reason) VALUES (?, ?, ?, ?)',
      [userId, bookingId, points, reason]
    );
    await db.execute(
      'UPDATE users SET total_points = total_points + ? WHERE id = ?',
      [points, userId]
    );
    return true;
  } catch (err) {
    console.error('Error adding points internal:', err);
    return false;
  }
};
