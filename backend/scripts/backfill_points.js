const db = require('../db/db');

async function backfill() {
  try {
    // 1. Get all finished bookings that don't have loyalty points yet
    const [bookings] = await db.execute(`
      SELECT b.id, b.user_id 
      FROM bookings b
      LEFT JOIN loyalty_points lp ON b.id = lp.booking_id AND lp.reason = 'service_complete'
      WHERE b.status = 'Selesai' AND lp.id IS NULL
    `);

    console.log(`Found ${bookings.length} finished bookings without points.`);

    for (const booking of bookings) {
      const pointsToAdd = 10;
      await db.execute(
        'INSERT INTO loyalty_points (user_id, booking_id, points, reason) VALUES (?, ?, ?, ?)',
        [booking.user_id, booking.id, pointsToAdd, 'service_complete']
      );
      await db.execute(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?',
        [pointsToAdd, booking.user_id]
      );
      console.log(`Added 10 points to user ${booking.user_id} for booking ${booking.id}`);
    }

    // 2. Also backfill points for reviews if any
    const [reviews] = await db.execute(`
      SELECT r.booking_id, r.user_id
      FROM reviews r
      LEFT JOIN loyalty_points lp ON r.booking_id = lp.booking_id AND lp.reason = 'review_bonus'
      WHERE lp.id IS NULL
    `);
    
    console.log(`Found ${reviews.length} reviews without points.`);
    for (const review of reviews) {
      const pointsToAdd = 20;
      await db.execute(
        'INSERT INTO loyalty_points (user_id, booking_id, points, reason) VALUES (?, ?, ?, ?)',
        [review.user_id, review.booking_id, pointsToAdd, 'review_bonus']
      );
      await db.execute(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?',
        [pointsToAdd, review.user_id]
      );
      console.log(`Added 20 points to user ${review.user_id} for review of booking ${review.booking_id}`);
    }

    console.log('Backfill complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

backfill();
