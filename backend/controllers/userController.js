const db = require('../db/db');

exports.updateProfile = async (req, res, next) => {
  const { name, phone, location, avatar_url } = req.body;
  try {
    await db.execute(
      'UPDATE users SET name = ?, phone = ?, location = ?, avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, location, avatar_url, req.user.id]
    );
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
