const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../socket');

exports.createBooking = async (req, res, next) => {
  const { name, phone, bike_size, service, date, time, voucher_code } = req.body;
  const user_id = req.user.id;

  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO bookings (id, user_id, name, phone, bike_size, service, date, time, voucher_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user_id, name, phone, bike_size, service, date, time, voucher_code || null]
    );

    // Create notification
    const notifId = uuidv4();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [notifId, user_id, 'Booking Berhasil', `Booking untuk ${service} pada ${date} pukul ${time} telah dibuat.`, 'booking']
    );

    const io = getIO();
    if (io) {
      io.to(user_id).emit('booking:created', { id, status: 'Menunggu', service, date, time });
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

    res.status(201).json({ id, status: 'Menunggu' });
  } catch (err) {
    next(err);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const [bookings] = await db.execute(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const [bookings] = await db.execute('SELECT * FROM bookings ORDER BY created_at DESC');
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
    
    // Notify user
    const [booking] = await db.execute('SELECT user_id, service FROM bookings WHERE id = ?', [id]);
    if (booking.length > 0) {
      const notifId = uuidv4();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
        [notifId, booking[0].user_id, 'Status Booking Diperbarui', `Status booking ${booking[0].service} Anda sekarang: ${status}`, 'booking']
      );

      const io = getIO();
      if (io) {
        io.to(booking[0].user_id).emit('booking:updated', { id, status, service: booking[0].service });
        io.to('admins').emit('booking:updated', { id, status, service: booking[0].service });
        io.to(booking[0].user_id).emit('notification:new', {
          id: notifId,
          title: 'Status Booking Diperbarui',
          message: `Status booking ${booking[0].service} Anda sekarang: ${status}`,
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
