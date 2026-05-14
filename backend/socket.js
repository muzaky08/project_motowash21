const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const db = require('./db/db');

let io;

function initSocket(server) {
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    socket.join(userId);
    if (socket.user.role === 'admin') {
      socket.join('admins');
    }

    try {
      await db.execute('UPDATE users SET is_online = true, last_seen = NOW() WHERE id = ?', [userId]);
      socket.broadcast.emit('user:online', { userId });
    } catch (error) {
      console.error('Socket online update failed:', error);
    }

    socket.on('typing:start', ({ receiverId }) => {
      if (receiverId) {
        socket.to(receiverId).emit('typing:start', { userId });
      }
    });

    socket.on('typing:stop', ({ receiverId }) => {
      if (receiverId) {
        socket.to(receiverId).emit('typing:stop', { userId });
      }
    });

    socket.on('message:read', ({ senderId }) => {
      if (senderId) {
        socket.to(senderId).emit('message:read', { readerId: userId });
      }
    });

    socket.on('disconnect', async () => {
      try {
        await db.execute('UPDATE users SET is_online = false, last_seen = NOW() WHERE id = ?', [userId]);
        socket.broadcast.emit('user:offline', { userId });
      } catch (error) {
        console.error('Socket offline update failed:', error);
      }
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
