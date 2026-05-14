const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket');

const db = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const messageRoutes = require('./routes/messageRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const bookingCardRoutes = require('./routes/bookingCardRoutes');
const pointsRoutes = require('./routes/pointsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const server = http.createServer(app);
initSocket(server);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(origin => origin.trim());
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Request Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/booking-cards', bookingCardRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/reviews', reviewRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Motowash API' });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Serve the frontend build when the backend runs as a normal Node server
// on hosts such as Hostinger. Vercel serves frontend assets separately.
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5005;
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown handlers to prevent EADDRINUSE during nodemon restart
  const gracefulShutdown = () => {
    console.log('Shutting down immediately to release port...');
    process.exit(0);
  };
  process.once('SIGUSR2', gracefulShutdown); // Nodemon restart
  process.once('SIGINT', gracefulShutdown);  // Ctrl+C
  process.once('SIGTERM', gracefulShutdown); // OS termination
}

module.exports = app;
