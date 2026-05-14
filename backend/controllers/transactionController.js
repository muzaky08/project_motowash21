const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../socket');

exports.createBooking = async (req, res, next) => {
  const { name, phone, bike_size, service, date, time, voucher_code, discount_amount } = req.body;
  const user_id = req.user.id;

  try {
    const id = uuidv4();
    
    // 1. Save booking with voucher info
    await db.execute(
      'INSERT INTO bookings (id, user_id, name, phone, bike_size, service, date, time, voucher_code, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user_id, name, phone, bike_size, service, date, time, voucher_code || null, discount_amount || 0]
    );

    // 2. If voucher used, increment used_count
    if (voucher_code) {
      await db.execute('UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?', [voucher_code]);
    }

    // 3. Auto-generate booking card
    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const card_code = `GRS-${year}-${randomChars}`;
    
    await db.execute(
      'INSERT INTO booking_cards (booking_id, card_code) VALUES (?, ?)',
      [id, card_code]
    );

    // 4. Create notification. Loyalty points are awarded only after completion/review.
    const notifId = uuidv4();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [notifId, user_id, 'Booking Berhasil', `Booking untuk ${service} pada ${date} pukul ${time} telah dibuat. Kode Kartu: ${card_code}`, 'booking']
    );

    const io = getIO();
    if (io) {
      io.to(user_id).emit('booking:created', { id, status: 'Menunggu', service, date, time, card_code });
      io.to('admins').emit('booking:created', {
        id,
        user_id,
        name,
        phone,
        bike_size,
        service,
        date,
        time,
        status: 'Menunggu',
        card_code,
        created_at: new Date(),
      });
      io.to('admins').emit('notification:new', {
        id: notifId,
        title: 'Booking Baru',
        message: `${name} membuat booking ${service} pada ${date} pukul ${time}.`,
        type: 'booking',
        is_read: false,
        created_at: new Date(),
      });
      io.to(user_id).emit('notification:new', {
        id: notifId,
        title: 'Booking Berhasil',
        message: `Booking untuk ${service} pada ${date} pukul ${time} telah dibuat.`,
        type: 'booking',
        is_read: false,
        created_at: new Date(),
      });
    }

    res.status(201).json({ id, status: 'Menunggu', card_code });
  } catch (err) {
    next(err);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const [bookings] = await db.execute(
      `SELECT b.*, bc.card_code, bc.status as card_status 
       FROM bookings b 
       LEFT JOIN booking_cards bc ON b.id = bc.booking_id 
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const [bookings] = await db.execute(
      `SELECT b.*, bc.card_code, bc.status as card_status 
       FROM bookings b 
       LEFT JOIN booking_cards bc ON b.id = bc.booking_id 
       ORDER BY b.created_at DESC`
    );
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    
    // Handle specific logic for 'Selesai' status
    const [bookingData] = await db.execute('SELECT user_id, service FROM bookings WHERE id = ?', [id]);
    
    if (bookingData.length > 0) {
      const { user_id, service } = bookingData[0];
      const notifId = uuidv4();

      if (status === 'Selesai') {
        // 1. Add loyalty points once when service is completed.
        const [existing] = await db.execute(
          'SELECT id FROM loyalty_points WHERE user_id = ? AND booking_id = ? AND reason = ?',
          [user_id, id, 'service_complete']
        );
        
        if (existing.length === 0) {
          const pointsToAdd = 10;
          await db.execute(
            'INSERT INTO loyalty_points (user_id, booking_id, points, reason) VALUES (?, ?, ?, ?)',
            [user_id, id, pointsToAdd, 'service_complete']
          );
          await db.execute(
            'UPDATE users SET total_points = total_points + ? WHERE id = ?',
            [pointsToAdd, user_id]
          );
        }

        // 2. Mark booking card as validated/used
        await db.execute(
          'UPDATE booking_cards SET status = "validated" WHERE booking_id = ?',
          [id]
        );
      }

      // Create notification
      const title = status === 'Selesai'
        ? 'Booking Selesai - +10 Poin'
        : 'Status Booking Diperbarui';
      const message = status === 'Selesai'
        ? `Layanan ${service} sudah selesai. Anda mendapatkan 10 poin. Beri rating untuk mendapatkan 10 poin tambahan.`
        : `Status booking ${service} Anda sekarang: ${status}`;

      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
        [notifId, user_id, title, message, 'booking']
      );

      const io = getIO();
      if (io) {
        io.to(user_id).emit('booking:updated', { id, status, service });
        io.to('admins').emit('booking:updated', { id, status, service });
        io.to(user_id).emit('notification:new', {
          id: notifId,
          title,
          message,
          type: 'booking',
          is_read: false,
          created_at: new Date(),
        });
      }
    }

    res.json({ message: 'Booking status updated' });
  } catch (err) {
    next(err);
  }
};
