const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Ensuring Points columns and tables exist...');

  try {
    // 1. Ensure users has total_points
    const [userCols] = await connection.execute("SHOW COLUMNS FROM users LIKE 'total_points'");
    if (userCols.length === 0) {
      await connection.execute('ALTER TABLE users ADD COLUMN total_points INT DEFAULT 0');
      console.log('Column "total_points" added to users.');
    }

    // 2. Ensure loyalty_points table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS loyalty_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        booking_id VARCHAR(36),
        points INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "loyalty_points" ensured.');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();
