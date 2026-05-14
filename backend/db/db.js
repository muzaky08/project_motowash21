const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'motowash_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

const promisePool = pool.promise();

// Test connection on startup
promisePool.getConnection()
  .then(connection => {
    console.log('✓ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.error('Make sure MySQL is running and the database credentials are correct.');
  });

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'PROTOCOL_ERROR') {
    console.error('Database protocol error.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ER_AUTHENTICATION_PLUGIN_NOT_SUPPORTED') {
    console.error('Database authentication plugin not supported.');
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Database access denied - check credentials.');
  }
});

module.exports = promisePool;

