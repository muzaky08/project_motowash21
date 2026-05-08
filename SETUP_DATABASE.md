# Setup Database Supabase - GARASI.21 MOTOWASH

## Langkah-langkah Setup Database

Website GARASI.21 MOTOWASH sekarang sudah terintegrasi dengan Supabase untuk semua fitur backend termasuk:
- Autentikasi user (login/register)
- Notifikasi real-time
- Chat real-time antara user dan admin
- Manajemen voucher/promo
- Booking motor
- Upload foto profile

Untuk mengaktifkan semua fitur ini, Anda perlu setup database di Supabase Dashboard.

### 1. Buka Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Login ke akun Supabase Anda
3. Pilih project: `kuukjdfwsmmussvmxjee`

### 2. Buat Tables

Masuk ke **SQL Editor** dan jalankan query berikut:

```sql
-- 1. Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Table: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'promo', 'chat', 'general')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Table: messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 4. Table: vouchers
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  max_usage INTEGER DEFAULT 0,
  current_usage INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vouchers
CREATE POLICY "Anyone can view active vouchers" ON vouchers
  FOR SELECT USING (active = true AND valid_until > NOW());

-- 5. Table: bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  bike_size TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'Menunggu',
  voucher_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create admin user in auth (optional - untuk testing)
-- Note: Jalankan ini jika Anda ingin membuat user admin untuk chat
-- INSERT INTO auth.users (id, email) VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'admin@garasi21.com');

-- INSERT INTO users (id, email, name, phone) VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'admin@garasi21.com', 'Admin GARASI.21', '081234567890');
```

### 3. Setup Storage Buckets

Di **Storage** section:

1. Buat bucket baru dengan nama: `avatars`
   - Public: No (Private)
   - Allowed MIME types: `image/*`

2. Setup policy untuk bucket `avatars`:

```sql
-- Policy untuk upload avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy untuk update avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy untuk delete avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy untuk read avatar (public read)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

### 4. Enable Realtime

Di **Database** > **Replication**:

1. Aktifkan realtime untuk tables:
   - `notifications` ✓
   - `messages` ✓
   - `bookings` ✓

### 5. Update Environment Variables (Opsional)

Jika Anda ingin mengubah service role key atau anon key, update di:
- `/utils/supabase/info.tsx` (untuk frontend)
- Environment variables di Supabase Edge Functions

## Testing Setup

Setelah setup database selesai, test fitur-fitur berikut:

### Test User Features:
1. **Register**: Buka `/user/auth` dan daftar akun baru
2. **Login**: Login dengan akun yang baru dibuat
3. **Profile**: Update profile dan upload foto
4. **Booking**: Buat booking baru
5. **Voucher**: Lihat voucher yang tersedia (setelah admin menambahkan)
6. **Chat**: Kirim pesan ke admin
7. **Notifikasi**: Cek notifikasi setelah booking atau chat

### Test Admin Features:
1. **Login Admin**: Masih menggunakan localStorage (username: admin, password: admin123)
2. **Voucher Management**: Tambah/edit/hapus voucher
3. **Booking Management**: Update status booking
4. **User List**: Lihat daftar user yang terdaftar

## Troubleshooting

### Error: "relation does not exist"
- Pastikan semua tables sudah dibuat dengan query SQL di atas
- Check di **Table Editor** apakah semua tables sudah ada

### Error: "permission denied"
- Check RLS policies sudah dibuat dengan benar
- Pastikan user sudah login dan memiliki akses

### Real-time tidak berfungsi
- Pastikan Realtime sudah enabled untuk tables notifications, messages, dan bookings
- Check browser console untuk error subscriptions

### Upload foto gagal
- Pastikan bucket `avatars` sudah dibuat
- Check storage policies sudah dibuat dengan benar

## Catatan Penting

1. **Admin Chat**: Untuk mengaktifkan chat admin dengan user, Anda perlu membuat user admin khusus dengan ID `admin` atau update `ADMIN_ID` constant di file `UserChat.tsx`

2. **Notification System**: Notifikasi akan otomatis dibuat saat:
   - User membuat booking baru
   - Admin update status booking
   - User/admin mengirim pesan chat

3. **Security**: 
   - Jangan share `SUPABASE_SERVICE_ROLE_KEY` di frontend
   - Semua tables sudah dilindungi dengan Row Level Security (RLS)
   - Upload file dibatasi hanya untuk owner

4. **Performance**:
   - Gunakan indexing untuk query yang sering digunakan
   - Monitor realtime connections di Supabase Dashboard

## Support

Jika ada masalah atau pertanyaan, check:
- Supabase Logs: https://supabase.com/dashboard/project/kuukjdfwsmmussvmxjee/logs
- Supabase Docs: https://supabase.com/docs
- Database schema: Lihat file `DATABASE_SCHEMA.md`

---

**Setup Selesai!** ✅

Website Anda sekarang fully functional dengan semua fitur backend terintegrasi dengan Supabase.
