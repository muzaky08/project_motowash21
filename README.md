# Motowash21

Struktur project sudah dipisahkan menjadi dua bagian utama:

- `frontend/` untuk aplikasi React + Vite.
- `backend/` untuk API Express, database, upload, route, controller, dan script migrasi.

## Menjalankan Project

Install dependency masing-masing aplikasi:

```bash
npm run install:all
```

Jalankan frontend:

```bash
npm run dev:frontend
```

Jalankan backend:

```bash
npm run dev:backend
```

Build frontend:

```bash
npm run build
```

Jalankan mode production Node hosting seperti Hostinger:

```bash
npm start
```

Entry point production ada di `server.js`, yang menjalankan backend Express dan menyajikan hasil build frontend dari `frontend/dist`.

## Database

Schema penuh ada di:

```bash
backend/database.sql
```

Import database:

```bash
mysql -u root -p < backend/database.sql
```

## Environment

Contoh konfigurasi tersedia di:

- `frontend/.env.example`
- `backend/.env.example`

File `.env` asli tetap diabaikan Git dan tidak sebaiknya dipublish.
