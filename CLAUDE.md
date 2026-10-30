# CLAUDE.md — MLBB Shop (Praktikum Modul 4, Kelompok C08)

Backend Express untuk toko Mobile Legends sederhana: player punya Diamond dan Battle Point (BP), bisa top up, main match, dan membeli hero. Skin hanya katalog (tidak bisa dibeli). **Tugas ini backend saja**: tidak ada frontend dan tidak ada login/JWT.

- **Repo GitHub (wajib public):** `pweb-express-c08-2026`
- **Deadline:** Minggu, 1 November 2026 pukul 23.59 (link repo dikumpulkan lewat Google Form)
- **Demo:** semua anggota wajib ikut dan menjelaskan bagian yang dikerjakannya sendiri
- **Sumber soal:** `../Chall4/Modul4_MLBB_Shop.docx` (gambar contoh response ada di sana)

## Instruksi untuk Claude

- Pengguna yang bekerja di repo ini adalah **Orang A (ketua)**. Lihat bagian [Peran Orang A](#peran-orang-a-ketua).
- Ikuti pembagian file di [Pembagian tugas](#pembagian-tugas). Jangan mengubah file milik B atau C kecuali A memintanya secara eksplisit (misalnya saat review PR).
- Setiap orang harus bisa menjelaskan kodenya saat demo. Saat membantu, jelaskan alasan setiap bagian, jangan hanya menulis kode.
- Nama tabel, kolom, dan nilai enum **harus sama persis** dengan [Skema database](#skema-database). Jangan mengganti nama.
- Paket Prisma selalu ditulis `@7` (`prisma@7`, `@prisma/client@7`, `@prisma/adapter-neon@7`). Tag `latest` di npm sudah Prisma 8 RC yang tidak cocok.
- Jangan pernah meng-commit `.env`, dan jangan menampilkan isi connection string di output.
- Ikuti gaya kode Modul 4: Express 5 (handler `async` cukup `throw`, tanpa `try/catch`), `req.body ?? {}`, `throw new HttpError(...)`, `sendSuccess(...)`.
- Setelah mengubah `schema.prisma`, selalu jalankan `npx prisma migrate dev` lalu `npx prisma generate`.

## Tech stack

| Bagian | Pilihan |
|---|---|
| Runtime | Node.js 22.12+ (laptop A: v22.22) |
| Framework | Express 5 + TypeScript, dijalankan dengan `tsx` |
| ORM | Prisma 7 dengan driver `@prisma/adapter-neon` |
| Database | PostgreSQL di Neon (region Singapore) |
| Lain-lain | `dotenv`. Library tambahan boleh, tapi tidak wajib |

## Perintah

```bash
npm run dev                          # server + auto-restart (tsx watch)
npm run typecheck                    # tsc --noEmit
npx prisma migrate dev --name <nama> # buat + jalankan migrasi (pakai URL direct)
npx prisma generate                  # WAJIB manual di Prisma 7, juga setelah clone
npx tsx prisma/seed.ts               # isi ulang database (hapus semua data dulu)
npx prisma studio                    # lihat isi database di browser
```

## Struktur project

```
pweb-express-c08-2026/
├── data/
│   ├── heroes.json            # dataset dari soal (133 hero)
│   └── skins.json             # dataset dari soal (892 skin)
├── prisma/
│   ├── migrations/            # otomatis dari migrate dev, ikut di-commit
│   ├── schema.prisma          # A
│   └── seed.ts                # A
├── src/
│   ├── config/prisma.ts       # A
│   ├── controllers/
│   │   ├── heroController.ts       # B
│   │   ├── skinController.ts       # B
│   │   ├── playerController.ts     # C
│   │   ├── statisticController.ts  # C
│   │   └── purchaseController.ts   # A (Beli Hero)
│   ├── generated/prisma/      # otomatis dari prisma generate, JANGAN di-commit
│   ├── middlewares/           # A: logger.ts, error.ts
│   ├── routes/
│   │   ├── index.ts           # A (satu-satunya yang mendaftarkan router)
│   │   ├── hero.routes.ts     # B
│   │   ├── skin.routes.ts     # B
│   │   ├── player.routes.ts   # C
│   │   └── statistic.routes.ts # C
│   ├── utils/                 # A: http-error.ts, parse.ts, response.ts, pagination.ts
│   └── index.ts               # A
├── .env                       # JANGAN di-commit
├── .gitignore
├── CLAUDE.md
├── README.md                  # B
├── package.json
├── prisma.config.ts           # A
└── tsconfig.json              # A
```

## Pembagian tugas

| | **A (Ketua): Fondasi, Kontrak, Fitur Inti** | **B: Katalog** | **C: Player & Saldo** |
|---|---|---|---|
| Fitur | Setup, repo, Neon, schema, migrate, seed, middleware (Fitur 1), helper bersama, `/health`, **Fitur 6 Beli Hero**, review + merge semua PR, testing akhir | **Fitur 2 Hero** (3 endpoint), **Fitur 3 Skin** (2 endpoint), README | **Fitur 4 Player** (4 endpoint), **Fitur 5 Top Up & Match** (2 endpoint), **Fitur 7 Statistik** |
| Materi demo | Schema + relasi + cascade, migrate, seed (TRUNCATE, createMany), middleware dan error handler, `$transaction` + `decrement` | Pagination, filter `contains` insensitive, filter enum, `include` relasi, validasi 400/409 | CRUD 400/404/409, `increment`, `count`, `aggregate`, `groupBy` |

**Prinsip:** A membuat kontrak (schema, format response, error handling, helper, kerangka routes). B dan C hanya mengisi fungsi di controller milik mereka. Kalau bagian A benar, kesalahan B atau C paling jauh hanya memengaruhi fitur mereka sendiri.

### Aturan kerja bersama

1. Satu repo GitHub milik kelompok. Setiap orang bekerja di branch sendiri: `feat/part-a` (A, satu branch untuk semua langkah A1 sampai A8), `feat/katalog` (B), `feat/player` (C). Branch `feat/fondasi` hanya berisi kerangka file kosong dan tidak dipakai lagi.
2. B dan C membuat Pull Request ke `main`. **Hanya A yang merge**, setelah mencoba PR di laptopnya sendiri.
3. Semua memakai database Neon yang sama. Isi `.env` dibagikan A lewat chat pribadi.
4. Migrasi hanya dijalankan oleh A. B dan C cukup menjalankan `npx prisma generate` setiap habis pull.
5. Kalau butuh helper baru di `src/utils`, minta ke A. Jangan buat versi sendiri.

## Jadwal

| Hari | A | B | C |
|---|---|---|---|
| **Jumat 30 Okt** (secepatnya) | Langkah A1 sampai A5 lalu push ke `main`. Kirim isi `.env` ke B dan C. Lanjut seed (A6) dan `/health` | Download dataset, clone setelah A push, `npm install`, `npx prisma generate`, import collection Postman, mulai Hero | Sama seperti B, mulai Player CRUD |
| **Sabtu 31 Okt** (pagi/siang rekam video challenge Modul 4) | Beli Hero (A7), review + merge PR yang masuk | Selesaikan Skin, uji Fitur 2 dan 3, tulis README, buat PR | Top Up, Match, Statistik, uji Fitur 4, 5, 7, buat PR |
| **Minggu 1 Nov** | Merge semua, seed ulang, jalankan seluruh Urutan Testcase berurutan, latihan demo bertiga, kumpulkan link repo **sebelum 23.59** | Bantu uji | Bantu uji |

## Peran Orang A (ketua)

### A1. Setup project dan repo

```bash
npm init -y
npm pkg set type=module
npm pkg set scripts.dev="tsx watch src/index.ts" scripts.start="tsx src/index.ts" scripts.typecheck="tsc --noEmit"
npm install express@5 @prisma/client@7 @prisma/adapter-neon@7 dotenv
npm install -D typescript tsx @types/node@22 @types/express prisma@7
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma --no-skills
mv prisma7.config.ts prisma.config.ts
mkdir -p data src/config src/controllers src/middlewares src/routes src/utils
```

- `prisma init` versi 7.10 membuat `prisma7.config.ts`, sehingga perlu di-rename. Opsi `--output` memastikan Prisma Client dibuat di `src/generated/prisma`, dan `--no-skills` mencegah folder skill AI ikut dibuat.
- `tsconfig.json`: salin dari Modul 4 bagian 3.2 langkah 6 (`include: ["src", "prisma", "prisma.config.ts"]`, supaya `seed.ts` ikut dicek).
- `.gitignore`: pastikan berisi `node_modules`, `dist`, `.env`, `/src/generated/prisma`.
- Buat repo **public** `pweb-express-c08-2026` di GitHub, lalu `git init`, commit, dan push.

### A2. Database Neon dan `.env`

1. console.neon.tech, klik **New Project**, pilih region **Singapore**.
2. Klik **Connect**. Dengan **Connection pooling** aktif, salin ke `DATABASE_URL`. Dengan pooling mati, salin ke `DATABASE_URL_UNPOOLED`.

```env
DATABASE_URL="postgresql://...-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://....ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
PORT=3000
```

`prisma.config.ts` (CLI memakai URL direct):

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL_UNPOOLED") },
});
```

`src/config/prisma.ts` (aplikasi memakai URL pooled): salin dari Modul 4 bagian 12 langkah 9.

### A3. Skema database

4 tabel dan 4 enum. Nama harus sama persis dengan gambar di soal.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  TANK
  FIGHTER
  ASSASSIN
  MAGE
  MARKSMAN
  SUPPORT
}

enum Lane {
  EXP
  GOLD
  MID
  JUNGLE
  ROAM
}

enum Rarity {
  COMMON
  EXCEPTIONAL
  DELUXE
  EXQUISITE
  GRAND
  SUPREME
}

enum Currency {
  BP
  DIAMOND
}

model Hero {
  id           Int          @id @default(autoincrement())
  name         String       @unique
  role         Role
  lane         Lane
  releaseYear  Int
  priceBP      Int?
  priceDiamond Int?
  skins        Skin[]
  owners       PlayerHero[]
}

model Skin {
  id           Int     @id @default(autoincrement())
  name         String
  rarity       Rarity
  priceDiamond Int?
  heroId       Int
  hero         Hero    @relation(fields: [heroId], references: [id], onDelete: Cascade)
}

model Player {
  id        Int          @id @default(autoincrement())
  nickname  String       @unique
  bp        Int          @default(10000)
  diamond   Int          @default(0)
  createdAt DateTime     @default(now())
  heroes    PlayerHero[]
}

model PlayerHero {
  id        Int      @id @default(autoincrement())
  playerId  Int
  heroId    Int
  currency  Currency
  pricePaid Int
  player    Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  hero      Hero     @relation(fields: [heroId], references: [id])

  @@unique([playerId, heroId])
}
```

Catatan:
- `priceBP` dan `priceDiamond` di Hero boleh kosong (`null` berarti hero tidak bisa dibeli dengan mata uang itu, contoh: Freya tidak punya harga BP).
- `Skin.priceDiamond` dibuat nullable untuk berjaga-jaga. Cek `skins.json`: kalau semua skin punya harga, `?` boleh dihapus.
- Cascade hanya di **Skin → Hero** dan **PlayerHero → Player**, sesuai soal.

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### A4. Helper bersama (`src/utils`) dan middleware

Salin dari Modul 4: `http-error.ts` dan `parse.ts` (bagian 8.4), `response.ts` (bagian 8.3), `middlewares/logger.ts` (bagian 4), `middlewares/error.ts` (bagian 8.4, sudah termasuk P2002 → 409, P2025 → 404, P2003 → 400, dan JSON rusak → 400).

Tambahkan `src/utils/pagination.ts` supaya format pagination sama di semua endpoint:

```ts
// src/utils/pagination.ts
export const getPagination = (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMetadata = (page: number, limit: number, totalItems: number) => ({
  currentPage: page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});
```

Cara pakai (untuk B):

```ts
const { page, limit, skip } = getPagination(req.query);
const [data, total] = await prisma.$transaction([
  prisma.hero.findMany({ where, skip, take: limit, orderBy: { id: "asc" } }),
  prisma.hero.count({ where }),
]);
sendSuccess(res, 200, "Berhasil mengambil data hero", data, buildMetadata(page, limit, total));
```

### A5. Kerangka routes (kontrak untuk B dan C)

Buat semua file routes dan controller dalam keadaan kosong (export `Router()` kosong), lalu daftarkan semuanya sekarang supaya B dan C tidak perlu menyentuh `routes/index.ts`:

```ts
// src/routes/index.ts
import { Router } from "express";
import { buyHero } from "../controllers/purchaseController";
import heroRouter from "./hero.routes";
import playerRouter from "./player.routes";
import skinRouter from "./skin.routes";
import statisticRouter from "./statistic.routes";

const router = Router();

router.use("/heroes", heroRouter);
router.use("/skins", skinRouter);
router.post("/players/:player_id/heroes", buyHero); // A, didaftarkan sebelum playerRouter
router.use("/players", playerRouter);
router.use("/statistics", statisticRouter);

export default router;
```

`src/index.ts`: salin dari Modul 4 bagian 12 langkah 10 (logger, `express.json()`, `/health` dengan `SELECT 1`, `app.use("/api", router)`, lalu `notFound` dan `errorHandler` paling bawah).

Setelah A1 sampai A5 selesai: `npm run typecheck` harus bersih, lalu push ke `main` dan beri tahu B dan C.

### A6. Seed (`prisma/seed.ts`)

Taruh `heroes.json` dan `skins.json` di `data/` (link dataset ada di soal). Urutan isi seed:

1. Kosongkan tabel dan reset id:
   ```ts
   await prisma.$executeRaw`TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE`;
   ```
2. `prisma.hero.createMany` dari `heroes.json`. Pemetaan kolom: `name`, `primaryRole` → `role`, `primaryLane` → `lane`, `releaseYear`, `priceBP`, `priceDiamond`. Id tidak diisi (urutan file sudah benar: Miya id 1, Hirara id 133).
3. `prisma.skin.createMany` dari `skins.json`: `name`, `heroId`, `rarity`, `priceDiamond`.
4. `prisma.player.createMany` (urut, supaya id 1, 2, 3):

   | id | nickname | bp | diamond |
   |---|---|---|---|
   | 1 | ArekITS | 1500 | 75 |
   | 2 | SangPushRank | 13000 | 2892 |
   | 3 | MageSurabaya | 10000 | 0 |

5. `prisma.playerHero.createMany`:

   | playerId | heroId | currency | pricePaid |
   |---|---|---|---|
   | 1 | 18 (Layla) | BP | 2000 |
   | 1 | 1 (Miya) | BP | 10800 |
   | 2 | 84 (Ling) | DIAMOND | 599 |
   | 2 | 56 (Gusion) | BP | 32000 |

6. Tutup koneksi dengan `await prisma.$disconnect()`.

- Baca JSON dengan `JSON.parse(readFileSync("data/heroes.json", "utf-8"))`. Import prisma dari `../src/config/prisma`.
- **Cek dulu format nilai di dataset.** Kalau `primaryRole`, `primaryLane`, atau `rarity` tidak huruf besar persis seperti enum (misalnya `Marksman`), ubah saat seed (`.toUpperCase()`), dan cek nilai yang tidak ada di enum.
- Verifikasi di `npx prisma studio`: 133 hero, 892 skin, 3 player, 4 PlayerHero.

### A7. Fitur 6: Beli Hero (`purchaseController.ts`)

`POST /api/players/:player_id/heroes`, body `{ heroId, currency }`, dengan `currency` bernilai `"BP"` atau `"DIAMOND"`.

Pemeriksaan **harus persis berurutan** dan berhenti di yang pertama gagal (testcase memeriksa kodenya):

| # | Kondisi | Status |
|---|---|---|
| 1 | `heroId` kosong, atau `currency` bukan `BP`/`DIAMOND` | 400 |
| 2 | Player tidak ditemukan | 404 |
| 3 | Hero tidak ditemukan | 404 |
| 4 | Harga hero untuk currency itu `null` | 400 |
| 5 | Player sudah memiliki hero itu | 409 |
| 6 | Saldo player kurang dari harga | 400 |

Simpan dengan `$transaction` bentuk **array** (bukan callback), berisi dua query:

```ts
const price = currency === "BP" ? hero.priceBP : hero.priceDiamond;
const balanceField = currency === "BP" ? "bp" : "diamond";

const [updatedPlayer] = await prisma.$transaction([
  prisma.player.update({
    where: { id: player.id },
    data: { [balanceField]: { decrement: price } },
  }),
  prisma.playerHero.create({
    data: { playerId: player.id, heroId: hero.id, currency, pricePaid: price },
  }),
]);
```

Response **201** berisi hero yang dibeli, mata uang, harga, serta saldo `bp` dan `diamond` terbaru (lihat gambar contoh di soal Fitur 6). Pemeriksaan #5 dilakukan dengan `prisma.playerHero.findUnique({ where: { playerId_heroId: { playerId, heroId } } })`.

### A8. Review, integrasi, dan testing akhir

- Untuk setiap PR: checkout branch-nya, `npm install`, `npx prisma generate`, `npm run typecheck`, coba endpoint-nya di Postman, baru merge.
- Hari Minggu: seed ulang, lalu jalankan **seluruh Urutan Testcase** dari collection Postman soal secara berurutan, dan bandingkan hasilnya dengan gambar contoh di soal.

### Checklist "A aman"

- [ ] Prisma Studio: 133 hero, 892 skin, 3 player, 4 PlayerHero sesuai tabel
- [ ] `GET /health` menghasilkan 200
- [ ] `GET /ngawur` menghasilkan 404 dengan format `{ "status": false, "message": ... }`
- [ ] Terminal mencetak log seperti `GET /api/heroes 200`
- [ ] Body JSON rusak menghasilkan 400, bukan 500
- [ ] Beli Hero: keenam pemeriksaan menghasilkan kode yang benar, dan saldo berkurang di dalam `$transaction`
- [ ] `.env` tidak ada di GitHub, repo public, dan namanya `pweb-express-c08-2026`

## Spesifikasi endpoint

### Format response

```json
{ "status": true, "message": "Berhasil mengambil data hero", "data": [], "metadata": {} }
{ "status": false, "message": "Hero tidak ditemukan" }
```

`metadata` (`currentPage`, `limit`, `totalItems`, `totalPages`) hanya ada di endpoint yang memakai pagination. Isi `message` boleh berbeda asal jelas.

### Daftar endpoint

| Fitur | Pemilik | Method | Endpoint |
|---|---|---|---|
| Health | A | GET | `/health` |
| 2. Hero | B | GET | `/api/heroes` |
| 2. Hero | B | GET | `/api/heroes/:hero_id` |
| 2. Hero | B | POST | `/api/heroes` |
| 3. Skin | B | GET | `/api/skins` |
| 3. Skin | B | GET | `/api/skins/:skin_id` |
| 4. Player | C | POST | `/api/players` |
| 4. Player | C | GET | `/api/players/:player_id` |
| 4. Player | C | PATCH | `/api/players/:player_id` |
| 4. Player | C | DELETE | `/api/players/:player_id` |
| 5. Top Up & Match | C | POST | `/api/players/:player_id/topup` |
| 5. Top Up & Match | C | POST | `/api/players/:player_id/matches` |
| 6. Beli Hero | A | POST | `/api/players/:player_id/heroes` |
| 7. Statistik | C | GET | `/api/statistics` |

### Fitur 1: Middleware (A)

Logger mencatat setiap request (`GET /api/heroes 200`). `HttpError` + `errorHandler` membuat semua error memakai format gagal. URL yang tidak terdaftar dibalas 404 oleh `notFound`.

### Fitur 2: Hero (B)

- **GET `/api/heroes`**: query `page`, `limit` (default 1 dan 10), `search` (nama mengandung kata, `mode: "insensitive"`), `role` (contoh `MARKSMAN`). Validasi `role` terhadap nilai enum supaya nilai asal-asalan tidak menyebabkan error 500.
- **GET `/api/heroes/:hero_id`**: hero beserta daftar skin-nya (`include: { skins: true }`). Tidak ada → 404.
- **POST `/api/heroes`**: body `name`, `role`, `lane`, `releaseYear`, `priceBP` (boleh kosong), `priceDiamond` (boleh kosong). Urutan: field wajib kosong → 400, nama sudah ada → 409, berhasil → 201 berisi hero baru.

### Fitur 3: Skin (B)

- **GET `/api/skins`**: skin beserta nama hero-nya (`include: { hero: { select: { id: true, name: true } } }`). Query `page`, `limit`, `heroId`, `rarity` (contoh `GRAND`).
- **GET `/api/skins/:skin_id`**: skin beserta hero-nya. Tidak ada → 404.

### Fitur 4: Player (C)

- **POST `/api/players`**: body hanya `nickname`. Saldo otomatis dari default schema (10000 BP, 0 Diamond). Kosong → 400, sudah dipakai → 409, berhasil → 201.
- **GET `/api/players/:player_id`**: data player beserta daftar hero yang dimilikinya (include `heroes` dengan `hero` di dalamnya). Tidak ada → 404.
- **PATCH `/api/players/:player_id`**: ganti `nickname`. Player tidak ada → 404, nickname kosong → 400, dipakai player lain → 409.
- **DELETE `/api/players/:player_id`**: hapus player, data PlayerHero ikut terhapus karena cascade. Tidak ada → 404.

### Fitur 5: Top Up & Match (C)

- **POST `/api/players/:player_id/topup`**: body `amount`. Urutan: bukan bilangan bulat > 0 → 400, player tidak ada → 404, berhasil → 200 dengan `diamond: { increment: amount }`, berisi saldo Diamond terbaru.
- **POST `/api/players/:player_id/matches`**: body `result` (`WIN` atau `LOSE`). Urutan: bukan WIN/LOSE → 400, player tidak ada → 404, berhasil → 200 dengan `bp: { increment: WIN ? 300 : 100 }`, berisi BP yang didapat dan saldo BP terbaru.

### Fitur 6: Beli Hero (A)

Lihat [A7](#a7-fitur-6-beli-hero-purchasecontrollerts).

### Fitur 7: Statistik (C)

**GET `/api/statistics`**:

| Field | Isi | Cara |
|---|---|---|
| `totalPlayers` | Jumlah player | `prisma.player.count()` |
| `totalHeroesOwned` | Jumlah baris PlayerHero | `prisma.playerHero.count()` |
| `totalDiamond` | Total saldo Diamond semua player | `aggregate` dengan `_sum: { diamond: true }` |
| `mostOwnedHero` | Hero paling banyak dimiliki + jumlah pemiliknya | `groupBy` PlayerHero berdasarkan `heroId`, urutkan `_count` terbesar, ambil 1, lalu cari nama hero-nya |
| `heroesPerRole` | Jumlah hero per role | `groupBy` Hero berdasarkan `role` |

## Aturan Diamond dan BP

| Aturan | Nilai |
|---|---|
| Saldo awal player baru | 10.000 BP dan 0 Diamond |
| Top up | Diamond bertambah sebesar `amount` (bilangan bulat > 0) |
| Hadiah match | WIN +300 BP, LOSE +100 BP |
| Beli hero | Pakai BP (`priceBP`) atau Diamond (`priceDiamond`). Harga `null` berarti tidak bisa dibeli dengan mata uang itu |
| Satu hero satu kali | Player tidak boleh membeli hero yang sudah dimilikinya |

## Untuk B dan C (setelah A push)

```bash
git clone https://github.com/<akun>/pweb-express-c08-2026.git
cd pweb-express-c08-2026
npm install
npx prisma generate
git checkout -b feat/katalog   # B, atau feat/player untuk C
```

Buat `.env` dengan isi dari A. Jangan menjalankan `migrate dev`. Selesai mengerjakan: `npm run typecheck`, uji di Postman, push branch, lalu buat Pull Request ke `main`.

## Masalah yang sering muncul

| Gejala | Solusi |
|---|---|
| `Cannot find module '../generated/prisma/client'` | `npx prisma generate` |
| `Environment variable not found: DATABASE_URL_UNPOOLED` | `.env` harus di root, dan `prisma.config.ts` diawali `import "dotenv/config"` |
| `P1001: Can't reach database server` | Neon sedang bangun dari scale to zero. Tunggu beberapa detik, lalu coba lagi |
| Prisma menawarkan reset saat migrate | Database sudah punya riwayat migrasi dari folder lain. Pakai project atau branch Neon baru |
| Muncul `prisma7.config.ts` | `mv prisma7.config.ts prisma.config.ts` |
| `/api/players/1/heroes` masuk ke router player | Route `buyHero` harus didaftarkan sebelum `router.use("/players", ...)` |
| `Do not know how to serialize a BigInt` | Raw query `COUNT(*)` ditulis `COUNT(*)::int` |
| Seed gagal karena nilai enum | Nilai di JSON tidak sama dengan enum. Ubah huruf besar atau petakan saat seed |
| Request pertama lambat | Cold start Neon. Panggil `/health` dulu sebelum demo |
