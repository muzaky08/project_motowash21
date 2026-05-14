const db = require('./db/db');

async function check() {
  try {
    const [booking_cards] = await db.execute('DESCRIBE booking_cards');
    console.log('BOOKING_CARDS:', booking_cards.map(c => c.Field));
    
    const [bookings] = await db.execute('DESCRIBE bookings');
    console.log('BOOKINGS:', bookings.map(c => c.Field));

    const [vouchers] = await db.execute('DESCRIBE vouchers');
    console.log('VOUCHERS:', vouchers.map(c => c.Field));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
