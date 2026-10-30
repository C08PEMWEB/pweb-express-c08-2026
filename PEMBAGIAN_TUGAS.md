# Pembagian Tugas Kelompok C08 — MLBB Shop

Dokumen ini untuk **B** dan **C**. Fondasi project (setup, database, schema, helper, middleware, kerangka routes, `/health`) sudah dibuat oleh **A**. Kalian cukup mengisi controller dan routes milik kalian sendiri.

- **Deadline:** Minggu, 1 November 2026 pukul 23.59
- **Demo:** setiap orang menjelaskan kode yang ditulisnya sendiri, jadi pahami setiap baris yang kalian tulis
- **Soal lengkap:** `Modul4_MLBB_Shop.docx` (ada gambar contoh response)
- **Materi:** `modul-4/README.md` (bagian 8.4, 13, 14, 15, dan 16)

---

## 1. Persiapan (sekali saja)

Tunggu sampai A memberi kabar bahwa kerangka sudah masuk `main`, lalu:

```bash
git clone https://github.com/C08PEMWEB/pweb-express-c08-2026.git
cd pweb-express-c08-2026
npm install
npx prisma generate
git checkout -b feat/katalog   # B
git checkout -b feat/player    # C
```

1. Buat file `.env` di root project. Isinya dikirim A lewat chat pribadi. **Jangan di-commit dan jangan dibagikan ke siapa pun.**
2. Jalankan `npm run dev`, lalu buka `http://localhost:3000/health`. Harus muncul `Server dan database OK`.
3. Import `mlbb-shop-testcase.postman_collection.json` ke Postman.

---

## 2. Aturan bersama

| Boleh | Tidak boleh |
|---|---|
| Mengedit file milik sendiri (lihat tabel di bagian 3 dan 4) | Mengedit file milik anggota lain |
| Memakai helper di `src/utils` | Membuat helper versi sendiri. Kalau butuh helper baru, minta ke A |
| `npx prisma generate` setiap habis `git pull` | `npx prisma migrate dev` (hanya A) |
| Membaca `prisma/schema.prisma` | Mengubah `schema.prisma` atau `src/routes/index.ts` |
| Push ke branch sendiri, lalu buat Pull Request ke `main` | Push langsung ke `main`, atau merge PR sendiri (hanya A yang merge) |

### Gaya kode (wajib sama dengan Modul 4)

Express 5 otomatis meneruskan error dari handler `async`, jadi **tidak perlu `try/catch`**.

```ts
import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

// Contoh umum (bukan salah satu endpoint tugas)
export const contohHandler = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);          // "3" -> 3, "abc" -> otomatis 400
  const { nama } = req.body ?? {};            // ?? {} supaya tidak crash kalau body kosong

  if (!nama) throw new HttpError(400, "Nama wajib diisi");

  const data = await prisma.contoh.findUnique({ where: { id } });
  if (!data) throw new HttpError(404, "Data tidak ditemukan");

  sendSuccess(res, 200, "Berhasil mengambil data", data);
};
```

### Helper yang sudah tersedia

| Helper | Fungsi |
|---|---|
| `throw new HttpError(status, message)` | Mengirim response gagal `{ status: false, message }` dengan kode status tersebut |
| `parseId(value)` | Mengubah param URL menjadi angka. Kalau bukan bilangan bulat positif, langsung 400 |
| `sendSuccess(res, status, message, data, metadata?)` | Mengirim response sukses `{ status: true, message, data, metadata }` |
| `getPagination(req.query)` | Menghasilkan `{ page, limit, skip }` (default page 1, limit 10, maksimal 100) |
| `buildMetadata(page, limit, totalItems)` | Menghasilkan `{ currentPage, limit, totalItems, totalPages }` |

Error handler juga sudah otomatis mengubah error Prisma: **P2002** (data unik bentrok) menjadi 409, **P2025** (data tidak ada) menjadi 404, dan **P2003** (relasi tidak valid) menjadi 400.

### Format response

```json
{ "status": true, "message": "Berhasil mengambil data hero", "data": [], "metadata": {} }
{ "status": false, "message": "Hero tidak ditemukan" }
```

`metadata` hanya untuk endpoint dengan pagination. Isi `message` boleh berbeda asal jelas.

---

## 3. Tugas B — Katalog (Hero & Skin) + README

**Branch:** `feat/katalog`

| File | Yang dikerjakan |
|---|---|
| `src/controllers/heroController.ts` | `getAllHeroes`, `getHeroById`, `createHero` |
| `src/controllers/skinController.ts` | `getAllSkins`, `getSkinById` |
| `src/routes/hero.routes.ts` | Daftarkan 3 handler hero (lihat komentar di file) |
| `src/routes/skin.routes.ts` | Daftarkan 2 handler skin (lihat komentar di file) |
| `README.md` | Dokumentasi project: deskripsi, tech stack, cara install dan menjalankan, daftar endpoint, anggota kelompok |

Router sudah terpasang oleh A di `/api/heroes` dan `/api/skins`, jadi di file routes cukup tulis path relatif (`"/"`, `"/:hero_id"`).

### Fitur 2: Hero

**`GET /api/heroes`**
- Query `page` dan `limit`: pakai `getPagination` dan `buildMetadata`.
- Query `search`: nama hero mengandung kata itu, tidak peduli huruf besar/kecil (`contains` + `mode: "insensitive"`).
- Query `role` (contoh `MARKSMAN`): **validasi dulu** terhadap nilai enum `Role`. Kalau tidak dicek, nilai asal-asalan seperti `role=ngawur` akan membuat Prisma error 500.
- Ambil data dan total sekaligus dengan `prisma.$transaction([findMany, count])`. Contohnya ada di `CLAUDE.md` bagian A4.

**`GET /api/heroes/:hero_id`**
- Tampilkan hero beserta skin-nya (`include: { skins: true }`).
- Hero tidak ada → 404.

**`POST /api/heroes`**
- Body: `name`, `role`, `lane`, `releaseYear`, `priceBP` (boleh kosong), `priceDiamond` (boleh kosong).
- Urutan pemeriksaan:
  1. `name`, `role`, `lane`, atau `releaseYear` kosong → 400
  2. Nama hero sudah ada → 409
  3. Berhasil → 201 berisi hero baru

### Fitur 3: Skin

**`GET /api/skins`**
- Sertakan nama hero: `include: { hero: { select: { id: true, name: true } } }`.
- Query `page`, `limit`, `heroId` (contoh `18`), `rarity` (contoh `GRAND`, validasi terhadap enum `Rarity`).

**`GET /api/skins/:skin_id`**
- Tampilkan skin beserta hero-nya.
- Skin tidak ada → 404.

### Testcase Postman yang harus lolos (B)

| No | Request | Hasil yang benar |
|---|---|---|
| 02 | `GET /api/heroes?role=MARKSMAN&limit=5` | 200, totalItems 20 |
| 03 | `GET /api/heroes?search=la` | 200, totalItems 10 |
| 04 | `GET /api/heroes/18` | 200, Layla dengan 11 skin |
| 05 | `GET /api/heroes/999` | 404 |
| 06 | `POST /api/heroes` (Collie) | 201, id 134 |
| 07 | `POST /api/heroes` (Collie lagi) | 409 |
| 08 | `POST /api/heroes` (hanya `name`) | 400 |
| 09 | `GET /api/skins?heroId=18` | 200, totalItems 11 |
| 10 | `GET /api/skins?rarity=GRAND` | 200, totalItems 98 |
| 11 | `GET /api/skins/891` | 200, Silverbolt Raiko (Selena) |

### Materi demo B
Pagination (`skip`/`take` + `count`), filter `contains` insensitive, filter enum, `include` relasi, dan validasi 400/409.

---

## 4. Tugas C — Player, Saldo, dan Statistik

**Branch:** `feat/player`

| File | Yang dikerjakan |
|---|---|
| `src/controllers/playerController.ts` | `createPlayer`, `getPlayerById`, `updatePlayer`, `deletePlayer`, `topUp`, `playMatch` |
| `src/controllers/statisticController.ts` | `getStatistics` |
| `src/routes/player.routes.ts` | Daftarkan 6 handler player (lihat komentar di file) |
| `src/routes/statistic.routes.ts` | Daftarkan 1 handler statistik |

Router sudah terpasang oleh A di `/api/players` dan `/api/statistics`. **Jangan** mendaftarkan `POST /:player_id/heroes` (Beli Hero), karena itu milik A dan sudah didaftarkan di `src/routes/index.ts`.

### Fitur 4: Player

**`POST /api/players`**
- Body hanya `nickname`. Saldo otomatis 10000 BP dan 0 Diamond dari default schema, jadi **jangan** diisi manual.
- `nickname` kosong → 400, sudah dipakai → 409, berhasil → 201.

**`GET /api/players/:player_id`**
- Tampilkan player beserta hero miliknya: `include: { heroes: { include: { hero: true } } }`.
- Player tidak ada → 404.

**`PATCH /api/players/:player_id`**
- Ganti `nickname`.
- Player tidak ada → 404, nickname kosong → 400, dipakai player lain → 409.

**`DELETE /api/players/:player_id`**
- Player tidak ada → 404.
- Data `PlayerHero` milik player ikut terhapus otomatis karena `onDelete: Cascade` di schema. Tidak perlu dihapus manual.

### Fitur 5: Top Up & Match

**`POST /api/players/:player_id/topup`**
- Body `amount`. Urutan pemeriksaan:
  1. `amount` bukan bilangan bulat lebih dari 0 → 400 (pakai `Number.isInteger`)
  2. Player tidak ada → 404
  3. Berhasil → 200. Tambah saldo dengan `diamond: { increment: amount }`, lalu kirim saldo Diamond terbaru.

**`POST /api/players/:player_id/matches`**
- Body `result` (`WIN` atau `LOSE`). Urutan pemeriksaan:
  1. `result` bukan `WIN`/`LOSE` → 400
  2. Player tidak ada → 404
  3. Berhasil → 200. `bp: { increment: ... }` dengan WIN +300 dan LOSE +100, lalu kirim BP yang didapat dan saldo BP terbaru.

### Fitur 7: Statistik

**`GET /api/statistics`**

| Field | Isi | Cara |
|---|---|---|
| `totalPlayers` | Jumlah player | `prisma.player.count()` |
| `totalHeroesOwned` | Jumlah baris PlayerHero | `prisma.playerHero.count()` |
| `totalDiamond` | Total saldo Diamond semua player | `aggregate` dengan `_sum: { diamond: true }` |
| `mostOwnedHero` | Hero paling banyak dimiliki + jumlah pemiliknya | `groupBy` PlayerHero berdasarkan `heroId`, urutkan `_count` terbesar, ambil 1, lalu cari nama hero-nya |
| `heroesPerRole` | Jumlah hero per role | `groupBy` Hero berdasarkan `role` |

### Testcase Postman yang harus lolos (C)

| No | Request | Hasil yang benar |
|---|---|---|
| 12 | `POST /api/players` (JunglerMalam) | 201, id 4 |
| 13 | `POST /api/players` (ArekITS) | 409 |
| 14 | `POST /api/players/3/topup` (706) | 200, diamond 706 |
| 15 | `POST /api/players/3/topup` (-10) | 400 |
| 16 | `POST /api/players/3/matches` (WIN) | 200, bp 10300 |
| 22 | `GET /api/players/3` | 200, punya Freya dan Layla (setelah A7 selesai) |
| 23 | `PATCH /api/players/3` (MageITS) | 200 |
| 24 | `PATCH /api/players/3` (ArekITS) | 409 |
| 25 | `GET /api/statistics` | 200, sesuai gambar Fitur 7 di soal |
| 26 | `DELETE /api/players/4` | 200 |
| 27 | `GET /api/players/4` | 404 |

### Materi demo C
CRUD dengan 400/404/409, `increment`, `count`, `aggregate`, dan `groupBy`.

---

## 5. Setelah selesai: buat Pull Request

```bash
npm run typecheck          # harus bersih, tanpa error
git add src README.md      # B
git add src                # C
git commit -m "feat: ..."
git push -u origin feat/katalog   # atau feat/player
```

1. Buka GitHub, lalu buat **Pull Request** dari branch kalian ke `main`.
2. Tulis di deskripsi PR testcase mana saja yang sudah dicoba dan hasilnya.
3. Kabari A. A akan mencoba PR di laptopnya, lalu merge kalau sudah benar.

**Jangan pernah meng-commit `.env`.** Cek dengan `git status` sebelum commit: `.env` tidak boleh muncul.

---

## 6. Jadwal

| Hari | B | C |
|---|---|---|
| **Jumat 30 Okt** | Clone, setup, mulai Hero | Clone, setup, mulai Player CRUD |
| **Sabtu 31 Okt** | Selesaikan Skin, uji testcase 02–11, tulis README, buat PR | Top Up, Match, Statistik, uji testcase 12–16 dan 22–27, buat PR |
| **Minggu 1 Nov** | Bantu uji seluruh testcase, latihan demo | Bantu uji seluruh testcase, latihan demo |

---

## 7. Masalah yang sering muncul

| Gejala | Solusi |
|---|---|
| `Cannot find module '../generated/prisma/client'` | `npx prisma generate` |
| `Environment variable not found` | `.env` belum ada atau tidak di root project |
| `P1001: Can't reach database server` | Neon sedang bangun dari tidur. Tunggu beberapa detik, lalu coba lagi |
| Request pertama lambat | Wajar (cold start Neon). Panggil `/health` dulu |
| Error 500 saat filter `role`/`rarity` asal-asalan | Validasi nilai query terhadap enum sebelum dipakai di `where` |
| `Do not know how to serialize a BigInt` | Hanya terjadi di raw query. Pakai `COUNT(*)::int`, atau pakai `count`/`groupBy` biasa |
