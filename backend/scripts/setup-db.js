const db = require('../db/db');

async function setupDatabase() {
  try {
    console.log('Setting up database indexes...');

    const queries = [
      'ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_sender_receiver (sender_id, receiver_id)',
      'ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_receiver_sender (receiver_id, sender_id)',
      'ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_created_at (created_at)',
      'ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_is_read (is_read)',
      'ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_user_id (user_id)',
      'ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_status (status)',
      'ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_booking_created (created_at)',
      'ALTER TABLE notifications ADD INDEX IF NOT EXISTS idx_notif_user_id (user_id)',
      'ALTER TABLE notifications ADD INDEX IF NOT EXISTS idx_notif_is_read (is_read)',
      'ALTER TABLE vouchers ADD INDEX IF NOT EXISTS idx_code (code)',
      'ALTER TABLE vouchers ADD INDEX IF NOT EXISTS idx_active (active)',
    ];

    for (const query of queries) {
      try {
        await db.execute(query);
        console.log(`✓ ${query}`);
      } catch (err) {
        console.log(`⚠ ${query}: ${err.message}`);
      }
    }

    console.log('\n✓ Database setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  }
}

setupDatabase();
