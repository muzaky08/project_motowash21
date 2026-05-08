# GARASI.21 MOTOWASH - Database Schema

## Tables

### 1. users
- id (uuid, primary key)
- email (text, unique)
- name (text)
- phone (text)
- avatar_url (text)
- location (text)
- created_at (timestamp)
- updated_at (timestamp)
- last_seen (timestamp)
- is_online (boolean)

### 2. notifications
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- title (text)
- message (text)
- type (text) - 'booking', 'promo', 'chat', 'general'
- read (boolean)
- created_at (timestamp)

### 3. messages
- id (uuid, primary key)
- sender_id (uuid, foreign key to users)
- receiver_id (uuid, foreign key to users)
- message (text)
- read (boolean)
- created_at (timestamp)

### 4. vouchers
- id (uuid, primary key)
- code (text, unique)
- title (text)
- description (text)
- discount_type (text) - 'percentage', 'fixed'
- discount_value (numeric)
- valid_from (timestamp)
- valid_until (timestamp)
- max_usage (integer)
- current_usage (integer)
- active (boolean)
- created_at (timestamp)

### 5. bookings (update existing localStorage)
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- name (text)
- phone (text)
- bike_size (text)
- service (text)
- date (text)
- time (text)
- status (text)
- voucher_code (text)
- created_at (timestamp)
- updated_at (timestamp)

### 6. user_profiles (extended profile data)
- user_id (uuid, primary key, foreign key to users)
- bio (text)
- preferences (jsonb)
- notification_settings (jsonb)

## Storage Buckets

### 1. avatars
- User profile pictures
- Admin profile pictures

### 2. service-images
- Gallery images uploaded by admin
