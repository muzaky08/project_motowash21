const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Migrating database...');

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "gallery" created or already exists.');

    // Add sample data if empty
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM gallery');
    if (rows[0].count === 0) {
      await connection.execute(`
        INSERT INTO gallery (url, title) VALUES 
        ('https://images.unsplash.com/photo-1763142185961-5a47a399e7a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBzaGluZXxlbnwxfHx8fDE3Nzc2MTc2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080', 'Sport Bike Polish'),
        ('https://images.unsplash.com/photo-1636761358756-ef34b4ef036a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcG9saXNoJTIwZGV0YWlsfGVufDF8fHx8MTc3NzYxNzYxNnww&ixlib=rb-4.1.0&q=80&w=1080', 'Detail Cleaning')
      `);
      console.log('Sample data inserted.');
    }

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();
