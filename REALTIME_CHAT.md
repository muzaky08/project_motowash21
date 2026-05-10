# Real-time Chat dan Dashboard Routes

## Route Frontend

- User dashboard: `/user/dashboard`
- User bookings: `/user/dashboard/bookings`
- User vouchers: `/user/dashboard/vouchers`
- User settings: `/user/dashboard/settings`
- User chat khusus: `/chat`
- Admin dashboard: `/admin/dashboard`
- Admin bookings: `/admin/dashboard/bookings`
- Admin services: `/admin/dashboard/services`
- Admin gallery: `/admin/dashboard/gallery`
- Admin vouchers: `/admin/dashboard/vouchers`
- Admin chat khusus: `/admin/chat`

## Menjalankan

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

Backend memakai Socket.io di server yang sama dengan Express, default `http://localhost:5000`.

## Data Chat

Chat tetap memakai tabel `messages` yang sudah ada:

- `id`
- `sender_id`
- `receiver_id`
- `message`
- `is_read`
- `created_at`

Saat pesan dikirim, backend menyimpan pesan ke MySQL lalu mengirim event Socket.io:

- `message:new` untuk penerima
- `message:sent` untuk pengirim
- `notification:new` untuk notifikasi in-app
- `typing:start` dan `typing:stop` untuk indikator mengetik
- `message:read` untuk status baca

## Notifikasi

Notifikasi dashboard memakai tabel `notifications`. Event booking, update profil, update status booking, dan pesan chat akan membuat notifikasi baru dan mengirim event real-time ke user terkait.

Browser notification memakai Web Notification API. Izin notifikasi diminta saat user membuka dashboard/chat.
