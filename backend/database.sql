-- Garasi.21 Motowash database bootstrap
-- Jalankan file ini di MySQL/MariaDB untuk membuat database baru beserta
-- semua tabel, relasi, index, dan data awal yang dipakai backend.

CREATE DATABASE IF NOT EXISTS motowash_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE motowash_db;

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  location TEXT,
  total_points INT NOT NULL DEFAULT 0,
  ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_is_online (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Services
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gallery_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('percent', 'nominal') NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  min_order DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  quota INT NOT NULL,
  used_count INT NOT NULL DEFAULT 0,
  valid_from DATETIME NOT NULL,
  valid_until DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_code (code),
  KEY idx_active (is_active),
  KEY idx_vouchers_validity (valid_from, valid_until),
  KEY idx_vouchers_usage (used_count, quota)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bookings / transactions
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  bike_size VARCHAR(50) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Menunggu',
  voucher_code VARCHAR(50) DEFAULT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_booking_created (created_at),
  KEY idx_bookings_voucher_code (voucher_code),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Booking cards
CREATE TABLE IF NOT EXISTS booking_cards (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id VARCHAR(36) NOT NULL,
  card_code VARCHAR(50) NOT NULL,
  status ENUM('pending', 'validated', 'expired') NOT NULL DEFAULT 'pending',
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validated_at DATETIME DEFAULT NULL,
  validated_by VARCHAR(36) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_cards_code (card_code),
  KEY idx_booking_cards_booking_id (booking_id),
  KEY idx_booking_cards_status (status),
  KEY idx_booking_cards_generated_at (generated_at),
  KEY idx_booking_cards_validated_by (validated_by),
  CONSTRAINT fk_booking_cards_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_booking_cards_validated_by
    FOREIGN KEY (validated_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Loyalty points
CREATE TABLE IF NOT EXISTS loyalty_points (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(36) DEFAULT NULL,
  points INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_loyalty_user_id (user_id),
  KEY idx_loyalty_booking_id (booking_id),
  KEY idx_loyalty_reason (reason),
  KEY idx_loyalty_created_at (created_at),
  CONSTRAINT fk_loyalty_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_loyalty_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_booking_id (booking_id),
  KEY idx_reviews_user_id (user_id),
  KEY idx_reviews_rating (rating),
  KEY idx_reviews_created_at (created_at),
  CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT fk_reviews_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notifications
-- user_id dibuat tanpa foreign key karena backend juga memakai target pseudo
-- seperti 'admin' untuk notifikasi panel admin.
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'promo', 'chat', 'general', 'review', 'voucher') NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_user_id (user_id),
  KEY idx_notif_is_read (is_read),
  KEY idx_notifications_type (type),
  KEY idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Messages
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sender_receiver (sender_id, receiver_id),
  KEY idx_receiver_sender (receiver_id, sender_id),
  KEY idx_created_at (created_at),
  KEY idx_is_read (is_read),
  KEY idx_messages_is_ai (is_ai),
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_messages_receiver
    FOREIGN KEY (receiver_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: admin user
-- Login awal:
--   email    : admin@garasi21.com
--   password : admin123
INSERT INTO users (id, email, password, name, role, ai_enabled, total_points)
VALUES
  (
    'admin-uuid-1',
    'admin@garasi21.com',
    '$2a$10$Rxu6c7731coBOGdGcJ1V..UQ8qI5D21kkh0MyciIXKOx6R5SxGXKa',
    'Admin GARASI.21',
    'admin',
    TRUE,
    0
  )
ON DUPLICATE KEY UPDATE id = id;

-- Seed: layanan awal
INSERT INTO services (id, name, description, price, image_url)
VALUES
  (
    'service-regular-wash',
    'Regular Wash',
    'Cuci salju, kaki-kaki, dan semir ban. Harga mulai dari motor ukuran M.',
    18000.00,
    NULL
  ),
  (
    'service-wash-and-wax',
    'Wash and Wax',
    'Regular wash ditambah wax body halus dan dressing body kasar. Harga mulai dari motor ukuran M.',
    25000.00,
    NULL
  ),
  (
    'service-premium-wash',
    'Premium Wash',
    'Wash and wax ditambah pembersih kerak mesin. Harga mulai dari motor ukuran M.',
    55000.00,
    NULL
  ),
  (
    'service-wash-and-polish',
    'Wash and Polish',
    'Cuci motor ditambah poles body 3 step. Harga mulai dari motor ukuran M.',
    185000.00,
    NULL
  ),
  (
    'service-detailing',
    'Detailing',
    'Cuci luar dalam secara detail, degreasing mesin, wax, dressing, dan semir ban. Harga mulai dari motor ukuran M.',
    285000.00,
    NULL
  )
ON DUPLICATE KEY UPDATE id = id;

-- Seed: galeri awal
INSERT INTO gallery (url, title)
SELECT
  'https://images.unsplash.com/photo-1763142185961-5a47a399e7a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBzaGluZXxlbnwxfHx8fDE3Nzc2MTc2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Sport Bike Polish'
WHERE NOT EXISTS (
  SELECT 1 FROM gallery WHERE title = 'Sport Bike Polish'
);

INSERT INTO gallery (url, title)
SELECT
  'https://images.unsplash.com/photo-1636761358756-ef34b4ef036a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcG9saXNoJTIwZGV0YWlsfGVufDF8fHx8MTc3NzYxNzYxNnww&ixlib=rb-4.1.0&q=80&w=1080',
  'Detail Cleaning'
WHERE NOT EXISTS (
  SELECT 1 FROM gallery WHERE title = 'Detail Cleaning'
);

-- Seed: voucher contoh untuk uji coba fitur voucher
INSERT INTO vouchers (
  code,
  title,
  description,
  type,
  value,
  min_order,
  quota,
  valid_from,
  valid_until,
  is_active
)
SELECT
  'WELCOME10',
  'Diskon Member Baru',
  'Potongan 10% untuk booking pertama.',
  'percent',
  10.00,
  30000.00,
  100,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 1 YEAR),
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM vouchers WHERE code = 'WELCOME10'
);

INSERT INTO vouchers (
  code,
  title,
  description,
  type,
  value,
  min_order,
  quota,
  valid_from,
  valid_until,
  is_active
)
SELECT
  'HEMAT25K',
  'Hemat 25 Ribu',
  'Potongan nominal untuk transaksi minimal Rp 150.000.',
  'nominal',
  25000.00,
  150000.00,
  50,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 1 YEAR),
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM vouchers WHERE code = 'HEMAT25K'
);
