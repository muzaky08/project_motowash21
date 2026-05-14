const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../socket');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../config/uploadPaths');

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

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    // Hapus avatar lama jika ada (bukan URL eksternal)
    const [users] = await db.execute('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
    const oldAvatar = users[0]?.avatar_url;
    if (oldAvatar && oldAvatar.startsWith('/uploads/')) {
      const oldPath = path.join(uploadDir, path.basename(oldAvatar));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Simpan path relatif ke database
    const avatarUrl = `/uploads/${req.file.filename}`;
    await db.execute(
      'UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [avatarUrl, req.user.id]
    );

    res.json({
      message: 'Avatar berhasil diperbarui',
      avatar_url: avatarUrl,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, name, role, avatar_url, phone, location, created_at FROM users'
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateAIConfig = async (req, res, next) => {
  const { ai_enabled } = req.body;
  try {
    await db.execute(
      'UPDATE users SET ai_enabled = ? WHERE id = ?',
      [ai_enabled, req.user.id]
    );
    res.json({ message: 'AI configuration updated', ai_enabled });
  } catch (err) {
    next(err);
  }
};
