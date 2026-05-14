const db = require('../db/db');

exports.createReview = async (req, res, next) => {
  const { booking_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    // 1. Check if booking exists and belongs to user and is 'Selesai'
    const [bookings] = await db.execute(
      'SELECT id, status, is_reviewed, service FROM bookings WHERE id = ? AND user_id = ?',
      [booking_id, user_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (bookings[0].status !== 'Selesai') {
      return res.status(400).json({ message: 'Hanya bisa memberikan rating pada layanan yang sudah selesai' });
    }

    if (bookings[0].is_reviewed) {
      return res.status(400).json({ message: 'Anda sudah memberikan ulasan untuk booking ini' });
    }

    // 2. Create review
    await db.execute(
      'INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [booking_id, user_id, rating, comment]
    );

    // 3. Mark booking as reviewed
    await db.execute('UPDATE bookings SET is_reviewed = true WHERE id = ?', [booking_id]);

    // 4. ADD LOYALTY POINTS FOR REVIEW (e.g. 20 points)
    const pointsForReview = 20;
    await db.execute(
      'INSERT INTO loyalty_points (user_id, booking_id, points, reason) VALUES (?, ?, ?, ?)',
      [user_id, booking_id, pointsForReview, 'review_bonus']
    );
    await db.execute(
      'UPDATE users SET total_points = total_points + ? WHERE id = ?',
      [pointsForReview, user_id]
    );

    // 5. Create notification for Admin
    const { v4: uuidv4 } = require('uuid');
    const { getIO } = require('../socket');
    const notifId = uuidv4();
    const [userData] = await db.execute('SELECT name FROM users WHERE id = ?', [user_id]);
    const userName = userData[0]?.name || 'User';

    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [notifId, 'admin', 'Ulasan Baru', `${userName} memberikan rating ${rating} untuk layanan ${bookings[0].service}`, 'review']
    );

    const io = getIO();
    if (io) {
      io.to('admins').emit('notification:new', {
        id: notifId,
        title: 'Ulasan Baru',
        message: `${userName} memberikan rating ${rating} untuk layanan ${bookings[0].service}`,
        type: 'review',
        is_read: false,
        created_at: new Date()
      });
    }

    res.status(201).json({ message: 'Ulasan berhasil dikirim, Anda mendapatkan 20 poin!' });
  } catch (err) {
    next(err);
  }
};

exports.getServiceReviews = async (req, res, next) => {
  try {
    const [reviews] = await db.execute(
      `SELECT r.*, u.name as user_name, u.avatar_url 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.created_at DESC LIMIT 20`
    );
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
