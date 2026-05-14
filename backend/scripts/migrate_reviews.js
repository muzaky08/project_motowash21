const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Migrating Reviews system...');

  try {
    // 1. Table reviews
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "reviews" created.');

    // 2. Add is_reviewed column to bookings to track if user has already reviewed
    const [bookingColumns] = await connection.execute("SHOW COLUMNS FROM bookings LIKE 'is_reviewed'");
    if (bookingColumns.length === 0) {
      await connection.execute('ALTER TABLE bookings ADD COLUMN is_reviewed BOOLEAN DEFAULT false');
      console.log('Column "is_reviewed" added to bookings.');
    }

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();
