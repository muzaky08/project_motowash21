const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Migrating Vouchers & Loyalty system...');

  try {
    // 1. Table vouchers
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('percent', 'nominal') NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        min_order DECIMAL(10, 2) DEFAULT 0,
        quota INT NOT NULL,
        used_count INT DEFAULT 0,
        valid_from DATETIME NOT NULL,
        valid_until DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist if table was created with old schema
    const [vColumns] = await connection.execute("SHOW COLUMNS FROM vouchers");
    const colNames = vColumns.map(c => c.Field);
    
    if (!colNames.includes('type')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN type ENUM('percent', 'nominal') NOT NULL AFTER description");
    }
    if (!colNames.includes('value')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN value DECIMAL(10, 2) NOT NULL AFTER type");
    }
    if (!colNames.includes('min_order')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN min_order DECIMAL(10, 2) DEFAULT 0 AFTER value");
    }
    if (!colNames.includes('quota')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN quota INT NOT NULL AFTER min_order");
    }
    if (!colNames.includes('used_count')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN used_count INT DEFAULT 0 AFTER quota");
    }
    if (!colNames.includes('valid_from')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN valid_from DATETIME NOT NULL AFTER used_count");
    }
    if (!colNames.includes('valid_until')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN valid_until DATETIME NOT NULL AFTER valid_from");
    }
    if (!colNames.includes('is_active')) {
      await connection.execute("ALTER TABLE vouchers ADD COLUMN is_active BOOLEAN DEFAULT true AFTER valid_until");
    }

    console.log('Table "vouchers" updated/checked.');

    // 2. Table booking_cards
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS booking_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(36) NOT NULL,
        card_code VARCHAR(50) UNIQUE NOT NULL,
        status ENUM('pending', 'validated', 'expired') DEFAULT 'pending',
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        validated_at DATETIME,
        validated_by VARCHAR(36),
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "booking_cards" created.');

    // 3. Table loyalty_points
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
    console.log('Table "loyalty_points" created.');

    // 4. Update users table (add total_points)
    const [userColumns] = await connection.execute("SHOW COLUMNS FROM users LIKE 'total_points'");
    if (userColumns.length === 0) {
      await connection.execute('ALTER TABLE users ADD COLUMN total_points INT DEFAULT 0');
      console.log('Column "total_points" added to users.');
    }

    // 5. Update bookings table (add voucher_code, discount_amount)
    const [bookingVoucherCode] = await connection.execute("SHOW COLUMNS FROM bookings LIKE 'voucher_code'");
    if (bookingVoucherCode.length === 0) {
      await connection.execute('ALTER TABLE bookings ADD COLUMN voucher_code VARCHAR(50)');
      console.log('Column "voucher_code" added to bookings.');
    }

    const [bookingDiscountAmount] = await connection.execute("SHOW COLUMNS FROM bookings LIKE 'discount_amount'");
    if (bookingDiscountAmount.length === 0) {
      await connection.execute('ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0');
      console.log('Column "discount_amount" added to bookings.');
    }

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();
