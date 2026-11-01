# MLBB Shop API

| Maulana Zaki Putra Zakaria | Fondasi project, middleware, Beli Hero |
| Iqbal Rizki Muhammad Fadhli | Hero, Skin, README |
| Keisya Dira Anugerah | Player, Top Up dan Match, Statistik |

Backend sederhana untuk toko Mobile Legends, dibuat untuk Praktikum Modul 4 (Pemrograman Web) — **Kelompok C08**.

Player memiliki dua mata uang, **Diamond** (dari top up) dan **Battle Point / BP** (dari match). Keduanya bisa dipakai untuk membeli hero. Skin hanya ditampilkan sebagai katalog (tidak bisa dibeli). Project ini hanya backend, tanpa frontend dan tanpa login/JWT.

## Tech Stack

| Bagian | Pilihan |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 5 + TypeScript (dijalankan dengan `tsx`) |
| ORM | Prisma 7 + `@prisma/adapter-neon` |
| Database | PostgreSQL di Neon |
| Lainnya | `dotenv` |

## Struktur Database

| Tabel | Isi |
|---|---|
| `Hero` | id, name (unik), role, lane, releaseYear, priceBP, priceDiamond |
| `Skin` | id, name, rarity, priceDiamond, heroId (cascade saat hero dihapus) |
| `Player` | id, nickname (unik), bp (default 10000), diamond (default 0), createdAt |
| `PlayerHero` | id, playerId, heroId, currency, pricePaid, unik per (playerId, heroId) |

Enum: `Role` (TANK, FIGHTER, ASSASSIN, MAGE, MARKSMAN, SUPPORT), `Lane` (EXP, GOLD, MID, JUNGLE, ROAM), `Rarity` (COMMON, EXCEPTIONAL, DELUXE, EXQUISITE, GRAND, SUPREME), `Currency` (BP, DIAMOND).

## Cara Install dan Menjalankan

1. Clone repo dan pasang dependensi:
   ```bash
   git clone https://github.com/C08PEMWEB/pweb-express-c08-2026.git
   cd pweb-express-c08-2026
   npm install
   ```
2. Buat file `.env` di root project:
   ```env
   # Pooled (host ada -pooler): dipakai aplikasi
   DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require"

   # Direct (tanpa -pooler): dipakai Prisma CLI
   DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/neondb?sslmode=require"

   PORT=3000
   ```
3. Buat Prisma Client (wajib manual di Prisma 7):
   ```bash
   npx prisma generate
   ```
4. Terapkan migrasi dan isi data awal (133 hero, 892 skin, 3 player):
   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```
5. Jalankan server:
   ```bash
   npm run dev
   ```
6. Cek `http://localhost:3000/health`. Harus muncul `Server dan database OK`.

Perintah lain: `npm run typecheck` (cek tipe TypeScript) dan `npx prisma studio` (lihat isi database di browser).

## Format Response

Sukses:
```json
{ "status": true, "message": "Berhasil mengambil data hero", "data": [], "metadata": {} }
```
Gagal:
```json
{ "status": false, "message": "Hero tidak ditemukan" }
```
`metadata` (`currentPage`, `limit`, `totalItems`, `totalPages`) hanya muncul pada endpoint dengan pagination.

## Daftar Endpoint

### Health
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Cek server dan koneksi database |

### Hero
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/heroes` | Daftar hero. Query: `page`, `limit`, `search` (nama, tidak peduli huruf besar/kecil), `role` |
| GET | `/api/heroes/:hero_id` | Detail hero beserta skin-nya. 404 jika tidak ada |
| POST | `/api/heroes` | Tambah hero. Body: `name`, `role`, `lane`, `releaseYear`, `priceBP?`, `priceDiamond?`. 400 jika field wajib kosong, 409 jika nama sudah ada, 201 jika berhasil |

### Skin
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/skins` | Daftar skin beserta nama hero. Query: `page`, `limit`, `heroId`, `rarity` |
| GET | `/api/skins/:skin_id` | Detail skin beserta hero. 404 jika tidak ada |

### Player
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/players` | Buat player. Body: `nickname` |
| GET | `/api/players/:player_id` | Detail player beserta hero yang dimiliki |
| PATCH | `/api/players/:player_id` | Ganti nickname |
| DELETE | `/api/players/:player_id` | Hapus player (data hero miliknya ikut terhapus) |

### Top Up, Match, dan Beli Hero
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/players/:player_id/topup` | Tambah Diamond. Body: `amount` (bilangan bulat > 0) |
| POST | `/api/players/:player_id/matches` | Hadiah BP. Body: `result` (`WIN` +300, `LOSE` +100) |
| POST | `/api/players/:player_id/heroes` | Beli hero. Body: `heroId`, `currency` (`BP` atau `DIAMOND`) |

### Statistik
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/statistics` | Total player, total hero dimiliki, total Diamond, hero terpopuler, jumlah hero per role |

## Contoh Request

```bash
# Hero role MARKSMAN, 5 data per halaman
curl "http://localhost:3000/api/heroes?role=MARKSMAN&limit=5"

# Cari hero yang namanya mengandung "la"
curl "http://localhost:3000/api/heroes?search=la"

# Skin milik hero Layla (id 18)
curl "http://localhost:3000/api/skins?heroId=18"

# Tambah hero
curl -X POST http://localhost:3000/api/heroes \
  -H "Content-Type: application/json" \
  -d '{"name":"Collie","role":"MAGE","lane":"MID","releaseYear":2026,"priceBP":32000,"priceDiamond":599}'
```

## Anggota Kelompok C08

| Nama | Bagian |
|---|---|
| (isi nama A) | Fondasi project, middleware, Beli Hero |
| (isi nama B) | Hero, Skin, README |
| (isi nama C) | Player, Top Up dan Match, Statistik |
