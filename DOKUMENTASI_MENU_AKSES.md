# Dokumentasi Menu, Fitur, dan Akses

Dokumen ini menjelaskan menu dan fitur yang tersedia pada aplikasi GARASI.21 Motowash, khususnya pembagian akses antara panel admin dan panel user/customer.

## Ringkasan Akses

| Role | Halaman Masuk | Dashboard | Hak Akses Utama |
| --- | --- | --- | --- |
| Admin | `/admin` | `/admin/dashboard` | Mengelola booking, layanan, galeri, voucher, validasi booking, chat customer, notifikasi, dan profil admin. |
| User | `/user/auth` | `/user/dashboard` | Membuat booking, melihat status booking, memakai voucher, melihat kartu booking, chat admin/AI, melihat notifikasi, memberi ulasan, dan mengelola profil. |
| Pengunjung | `/` | - | Melihat halaman publik, informasi layanan, galeri, testimoni, kontak, dan form booking publik. |

## Akses Umum / Pengunjung

Halaman utama dapat diakses melalui route `/`.

Menu pada navbar halaman utama:

1. **Beranda**
   - Menampilkan tampilan awal website GARASI.21 Motowash.

2. **Tentang**
   - Menampilkan informasi singkat tentang bisnis/layanan.

3. **Layanan**
   - Menampilkan daftar layanan cuci motor.

4. **Keunggulan**
   - Menampilkan keunggulan layanan.

5. **Galeri**
   - Menampilkan foto galeri layanan.

6. **Testimoni**
   - Menampilkan ulasan/testimoni pelanggan.

7. **Booking**
   - Menampilkan form booking publik.
   - Data yang diisi: nama, nomor WhatsApp, jenis/ukuran motor, layanan, tanggal, dan jam.

8. **Kontak**
   - Menampilkan informasi kontak.

9. **Login / Dashboard**
   - Jika belum login, tombol mengarah ke `/user/auth`.
   - Jika sudah login sebagai user, tombol mengarah ke `/user/dashboard`.
   - Jika sudah login sebagai admin, tombol mengarah ke `/admin/dashboard`.

## Dashboard Admin

Dashboard admin hanya dapat diakses oleh akun dengan role `admin`.

Route utama:

- `/admin/dashboard`
- `/admin/dashboard/:section`
- `/admin/chat`

Menu/fitur pada dashboard admin:

1. **Dashboard**
   - Route: `/admin/dashboard`
   - Menampilkan ringkasan data operasional.
   - Fitur yang tersedia:
     - Melihat jumlah booking hari ini.
     - Melihat total pelanggan.
     - Melihat total layanan.
     - Melihat jumlah booking dengan status menunggu.
     - Melihat aktivitas terbaru dari booking dan chat.
     - Shortcut untuk membuka menu booking atau chat.

2. **Booking**
   - Route: `/admin/dashboard/bookings`
   - Digunakan untuk mengelola booking customer.
   - Fitur yang tersedia:
     - Melihat semua booking yang masuk.
     - Mencari booking berdasarkan nama, nomor telepon, atau layanan.
     - Filter booking berdasarkan status.
     - Refresh data booking.
     - Mengubah status booking.
   - Status booking yang tersedia:
     - Menunggu
     - Dikonfirmasi
     - Sedang Proses
     - Selesai
     - Dibatalkan

3. **Layanan**
   - Route: `/admin/dashboard/services`
   - Digunakan untuk mengelola daftar layanan.
   - Fitur yang tersedia:
     - Melihat daftar layanan.
     - Menambah layanan baru.
     - Mengedit nama layanan.
     - Mengedit daftar treatment.
     - Mengedit harga berdasarkan ukuran motor M, L, dan XL.
     - Menghapus layanan.

4. **Galeri**
   - Route: `/admin/dashboard/gallery`
   - Digunakan untuk mengelola foto galeri.
   - Fitur yang tersedia:
     - Melihat daftar foto galeri.
     - Menambah/upload foto melalui URL gambar.
     - Mengisi judul foto.
     - Melihat preview gambar sebelum disimpan.
     - Mengedit foto.
     - Menghapus foto.

5. **Voucher**
   - Route: `/admin/dashboard/vouchers`
   - Digunakan untuk mengelola voucher promo dan validasi booking.
   - Subfitur:
     - **Kelola Voucher**
       - Melihat daftar voucher.
       - Menambah voucher baru.
       - Mengedit voucher.
       - Mengaktifkan atau menonaktifkan voucher.
       - Menghapus/menonaktifkan voucher.
       - Mengatur kode voucher, judul, deskripsi, tipe diskon, nilai diskon, minimal transaksi, kuota, dan masa berlaku.
       - Generate kode voucher otomatis.
     - **Validasi Booking**
       - Memasukkan kode booking/kartu booking.
       - Melihat detail booking berdasarkan kode.
       - Memvalidasi booking sebagai selesai/digunakan.
       - Melihat riwayat validasi terbaru.

6. **Chat**
   - Route:
     - `/admin/dashboard/chat`
     - `/admin/chat`
   - Digunakan untuk membalas pesan customer.
   - Fitur yang tersedia:
     - Melihat daftar percakapan customer.
     - Mencari customer atau pesan.
     - Filter percakapan semua atau belum dibaca.
     - Membuka ruang chat dengan customer.
     - Mengirim pesan ke customer.
     - Melihat indikator pesan belum dibaca.
     - Melihat indikator sedang mengetik.
     - Chat real-time melalui socket.

7. **Pengaturan**
   - Route: `/admin/dashboard/settings`
   - Digunakan untuk mengelola profil admin.
   - Fitur yang tersedia:
     - Upload foto profil.
     - Mengubah nama.
     - Melihat email akun.
     - Mengubah nomor WhatsApp.
     - Mengubah lokasi.
     - Menyimpan perubahan profil.
     - Form ubah password tersedia di UI.

8. **Notifikasi Admin**
   - Tersedia di header dashboard admin.
   - Fitur yang tersedia:
     - Melihat notifikasi booking terbaru.
     - Melihat notifikasi chat terbaru.
     - Menandai satu notifikasi sebagai dibaca.
     - Menandai semua notifikasi sebagai dibaca.
     - Klik notifikasi untuk menuju menu terkait.

9. **Aksi Header Admin**
   - Kembali ke beranda.
   - Toggle tema terang/gelap.
   - Membuka pengaturan profil.
   - Logout.

## Dashboard User / Customer

Dashboard user hanya dapat diakses oleh akun dengan role `user`.

Route utama:

- `/user/dashboard`
- `/user/dashboard/:section`
- `/chat` diarahkan ke `/user/dashboard/chat`

Menu/fitur pada dashboard user:

1. **Dashboard**
   - Route: `/user/dashboard`
   - Menampilkan ringkasan akun customer.
   - Fitur yang tersedia:
     - Melihat jumlah booking aktif.
     - Melihat jumlah voucher tersedia.
     - Melihat jumlah pesan baru.
     - Melihat total poin loyalitas.
     - Melihat aktivitas terakhir dari booking dan notifikasi.
     - Shortcut ke booking, voucher, dan chat.

2. **Booking Saya**
   - Route: `/user/dashboard/bookings`
   - Digunakan untuk membuat dan memantau booking.
   - Fitur yang tersedia:
     - Membuat booking baru.
     - Mengisi nama dan nomor WhatsApp.
     - Memilih ukuran motor M, L, atau XL.
     - Memilih layanan.
     - Memilih tanggal dan jam booking.
     - Memasukkan kode voucher.
     - Validasi voucher sebelum booking dibuat.
     - Melihat booking aktif.
     - Melihat status booking.
     - Melihat kode kartu booking jika tersedia.
     - Melihat riwayat layanan selesai atau dibatalkan.
     - Memberi rating/ulasan untuk booking yang sudah selesai.

3. **Voucher**
   - Route: `/user/dashboard/vouchers`
   - Digunakan untuk melihat voucher, poin, dan kartu booking.
   - Subfitur:
     - **Kartu Booking**
       - Melihat kartu booking aktif.
       - Melihat kode booking.
       - Melihat status kartu booking.
       - Download kartu booking dalam format PNG.
       - Melihat riwayat kartu booking yang sudah digunakan atau expired.
     - **Voucher Promo**
       - Melihat daftar voucher aktif.
       - Melihat kode voucher.
       - Menyalin kode voucher.
       - Melihat nilai potongan dan masa berlaku.
     - **Poin Loyalitas**
       - Melihat total poin loyalitas.
       - Melihat progress reward menuju 100 poin.

4. **Chat**
   - Route: `/user/dashboard/chat`
   - Digunakan untuk menghubungi admin atau Garasi AI.
   - Fitur yang tersedia:
     - Membuka percakapan dengan Admin GARASI.21.
     - Mengirim pesan ke admin.
     - Menerima pesan secara real-time.
     - Melihat indikator admin sedang mengetik.
     - Menggunakan quick reply, seperti daftar layanan, detail layanan, lokasi, dan info voucher.
     - Menerima balasan dari Garasi AI.
     - Tombol untuk menghubungi admin manusia saat balasan berasal dari AI.

5. **Pengaturan**
   - Route: `/user/dashboard/settings`
   - Digunakan untuk mengelola profil customer.
   - Fitur yang tersedia:
     - Upload foto profil.
     - Mengubah nama lengkap.
     - Melihat email akun.
     - Mengubah nomor WhatsApp.
     - Mengubah lokasi.
     - Menyimpan perubahan profil.
     - Form ubah password tersedia di UI.

6. **Notifikasi User**
   - Tersedia di header dashboard user.
   - Fitur yang tersedia:
     - Melihat daftar notifikasi.
     - Melihat jumlah notifikasi belum dibaca.
     - Menandai satu notifikasi sebagai dibaca.
     - Menandai semua notifikasi sebagai dibaca.
     - Klik notifikasi untuk menuju menu terkait, seperti booking, voucher, chat, atau pengaturan.

7. **Aksi Header User**
   - Kembali ke beranda.
   - Toggle tema terang/gelap.
   - Membuka pengaturan akun.
   - Logout.

## Perbedaan Akses Admin dan User

| Fitur | Admin | User |
| --- | --- | --- |
| Melihat dashboard ringkasan | Ya | Ya |
| Membuat booking | Tidak dari panel admin | Ya |
| Melihat semua booking customer | Ya | Tidak |
| Melihat booking milik sendiri | Tidak | Ya |
| Mengubah status booking | Ya | Tidak |
| Validasi kode/kartu booking | Ya | Tidak |
| Mengelola layanan | Ya | Tidak |
| Mengelola galeri | Ya | Tidak |
| Mengelola voucher | Ya | Tidak |
| Melihat dan memakai voucher | Tidak sebagai customer | Ya |
| Melihat poin loyalitas | Tidak | Ya |
| Melihat kartu booking | Tidak | Ya |
| Download kartu booking | Tidak | Ya |
| Chat dengan customer | Ya | Tidak |
| Chat dengan admin/AI | Tidak | Ya |
| Mengelola profil sendiri | Ya | Ya |
| Melihat notifikasi | Ya | Ya |

## Catatan Role dan Proteksi Route

1. Route admin dilindungi oleh pengecekan role `admin`.
2. Route user dilindungi oleh pengecekan role `user`.
3. Jika user belum login, akses dashboard akan diarahkan ke halaman login sesuai role.
4. Jika akun login tetapi role tidak sesuai, aplikasi akan mengarahkan ke dashboard sesuai role akun tersebut.
5. Route tidak dikenal akan diarahkan kembali ke halaman utama `/`.
