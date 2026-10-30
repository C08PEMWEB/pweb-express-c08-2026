// prisma/seed.ts
// Jalankan: npx tsx prisma/seed.ts (semua data lama dihapus dulu)
import { readFileSync } from "node:fs";
import prisma from "../src/config/prisma";
import type { Lane, Rarity, Role } from "../src/generated/prisma/client";

// Hanya kolom yang dipakai. Kolom lain di JSON (note, series, dll.) diabaikan
type HeroJson = {
  name: string;
  primaryRole: Role;
  primaryLane: Lane;
  releaseYear: number;
  priceBP: number | null;
  priceDiamond: number | null;
};

type SkinJson = {
  name: string;
  heroId: number;
  rarity: Rarity;
  priceDiamond: number | null;
};

const readJson = <T>(path: string): T[] => JSON.parse(readFileSync(path, "utf-8"));

const main = async () => {
  // 1. Kosongkan tabel dan kembalikan id ke 1 (CASCADE untuk relasi antar tabel)
  await prisma.$executeRaw`TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE`;

  // 2. Hero: id tidak diisi, urutan file sudah benar (Miya id 1, Hirara id 133)
  const heroes = readJson<HeroJson>("data/heroes.json");
  const heroResult = await prisma.hero.createMany({
    data: heroes.map((h) => ({
      name: h.name,
      role: h.primaryRole,
      lane: h.primaryLane,
      releaseYear: h.releaseYear,
      priceBP: h.priceBP,
      priceDiamond: h.priceDiamond,
    })),
  });

  // 3. Skin: heroId di file sudah cocok dengan id hero di atas
  const skins = readJson<SkinJson>("data/skins.json");
  const skinResult = await prisma.skin.createMany({
    data: skins.map((s) => ({
      name: s.name,
      heroId: s.heroId,
      rarity: s.rarity,
      priceDiamond: s.priceDiamond,
    })),
  });

  // 4. Player: urutan array menentukan id (1, 2, 3)
  const playerResult = await prisma.player.createMany({
    data: [
      { nickname: "ArekITS", bp: 1500, diamond: 75 },
      { nickname: "SangPushRank", bp: 13000, diamond: 2892 },
      { nickname: "MageSurabaya", bp: 10000, diamond: 0 },
    ],
  });

  // 5. Hero yang sudah dimiliki player
  const ownedResult = await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: "BP", pricePaid: 2000 }, // Layla
      { playerId: 1, heroId: 1, currency: "BP", pricePaid: 10800 }, // Miya
      { playerId: 2, heroId: 84, currency: "DIAMOND", pricePaid: 599 }, // Ling
      { playerId: 2, heroId: 56, currency: "BP", pricePaid: 32000 }, // Gusion
    ],
  });

  console.log(
    `Seed selesai: ${heroResult.count} hero, ${skinResult.count} skin, ` +
      `${playerResult.count} player, ${ownedResult.count} PlayerHero`,
  );
};

// 6. Tutup koneksi, baik seed berhasil maupun gagal
main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
