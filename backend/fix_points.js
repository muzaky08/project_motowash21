const db = require('./db/db');

async function fix() {
  try {
    await db.execute('UPDATE users SET total_points = 0 WHERE total_points IS NULL');
    console.log('Successfully initialized NULL points to 0');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
