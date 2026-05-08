const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

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
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  const { receiver_id, message } = req.body;
  const sender_id = req.user.id;

  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO messages (id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
      [id, sender_id, receiver_id, message]
    );
    res.status(201).json({ id, sender_id, receiver_id, message });
  } catch (err) {
    next(err);
  }
};
