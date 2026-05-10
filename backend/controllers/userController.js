const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../socket');

exports.updateProfile = async (req, res, next) => {
  const { name, phone, location, avatar_url } = req.body;
  try {
    await db.execute(
      'UPDATE users SET name = ?, phone = ?, location = ?, avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, location, avatar_url, req.user.id]
    );

    const notifId = uuidv4();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [notifId, req.user.id, 'Profil Diperbarui', 'Informasi profil akun Anda berhasil diperbarui.', 'general']
    );

    const io = getIO();
    if (io) {
      io.to(req.user.id).emit('profile:updated', { name, phone, location, avatar_url });
      io.to(req.user.id).emit('notification:new', {
        id: notifId,
        title: 'Profil Diperbarui',
        message: 'Informasi profil akun Anda berhasil diperbarui.',
        type: 'general',
        is_read: false,
        created_at: new Date(),
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT id, email, name, role, created_at FROM users');
    res.json(users);
  } catch (err) {
    next(err);
  }
};
