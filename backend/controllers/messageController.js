const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../socket');

exports.getMessagesWithUser = async (req, res, next) => {
  const { receiverId } = req.params;
  const userId = req.user.id;

  try {
    const [messages] = await db.execute(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [userId, receiverId, receiverId, userId]
    );

    await db.execute(
      'UPDATE messages SET is_read = true WHERE sender_id = ? AND receiver_id = ?',
      [receiverId, userId]
    );

    const io = getIO();
    if (io) {
      io.to(receiverId).emit('message:read', { readerId: userId });
    }

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar_url,
        u.is_online,
        u.last_seen,
        latest.message AS last_message,
        latest.created_at AS last_message_at,
        COALESCE(unread.unread_count, 0) AS unread_count
      FROM (
        SELECT
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
          MAX(created_at) AS last_message_at
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_user_id
      ) c
      JOIN users u ON u.id = c.other_user_id
      JOIN messages latest
        ON latest.created_at = c.last_message_at
        AND (
          (latest.sender_id = ? AND latest.receiver_id = c.other_user_id)
          OR (latest.sender_id = c.other_user_id AND latest.receiver_id = ?)
        )
      LEFT JOIN (
        SELECT sender_id, COUNT(*) AS unread_count
        FROM messages
        WHERE receiver_id = ? AND is_read = false
        GROUP BY sender_id
      ) unread ON unread.sender_id = u.id
      ORDER BY latest.created_at DESC`,
      [userId, userId, userId, userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS unread_count FROM messages WHERE receiver_id = ? AND is_read = false',
      [req.user.id]
    );
    res.json({ unread_count: rows[0]?.unread_count || 0 });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  const { receiver_id, message } = req.body;
  const sender_id = req.user.id;

  try {
    const id = uuidv4();
    const created_at = new Date();
    await db.execute(
      'INSERT INTO messages (id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
      [id, sender_id, receiver_id, message]
    );

    const [senderRows] = await db.execute(
      'SELECT id, name, role, avatar_url, is_online FROM users WHERE id = ?',
      [sender_id]
    );

    const notificationId = uuidv4();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [notificationId, receiver_id, `Pesan baru dari ${senderRows[0]?.name || 'Pengguna'}`, message, 'chat']
    );

    const payload = {
      id,
      sender_id,
      receiver_id,
      message,
      is_read: false,
      created_at,
      sender: senderRows[0] || null,
    };

    const io = getIO();
    if (io) {
      io.to(receiver_id).emit('message:new', payload);
      io.to(receiver_id).emit('notification:new', {
        id: notificationId,
        title: `Pesan baru dari ${senderRows[0]?.name || 'Pengguna'}`,
        message,
        type: 'chat',
        is_read: false,
        created_at,
      });
      io.to(sender_id).emit('message:sent', payload);
    }

    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};
