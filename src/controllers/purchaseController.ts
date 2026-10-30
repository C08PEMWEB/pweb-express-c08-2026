// src/controllers/purchaseController.ts (A)
import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

// POST /api/players/:player_id/heroes (Fitur 6)
// Pemeriksaan harus berurutan dan berhenti di yang pertama gagal
export const buyHero = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id);
  // Express 5: req.body = undefined jika body tidak ter-parse, jadi beri fallback {}
  const { heroId, currency } = req.body ?? {};

  // 1. Validasi body
  const heroIdNum = Number(heroId);
  if (!Number.isInteger(heroIdNum) || heroIdNum <= 0) {
    throw new HttpError(400, "heroId wajib diisi dengan bilangan bulat positif");
  }
  if (currency !== "BP" && currency !== "DIAMOND") {
    throw new HttpError(400, "currency harus BP atau DIAMOND");
  }

  // 2. Player harus ada
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) throw new HttpError(404, "Player tidak ditemukan");

  // 3. Hero harus ada
  const hero = await prisma.hero.findUnique({ where: { id: heroIdNum } });
  if (!hero) throw new HttpError(404, "Hero tidak ditemukan");

  // 4. Harga null = hero tidak dijual dengan mata uang itu (contoh: Freya tanpa harga BP)
  const price = currency === "BP" ? hero.priceBP : hero.priceDiamond;
  if (price === null) {
    throw new HttpError(400, `Hero ${hero.name} tidak bisa dibeli dengan ${currency}`);
  }

  // 5. Satu player tidak boleh membeli hero yang sama dua kali
  const owned = await prisma.playerHero.findUnique({
    where: { playerId_heroId: { playerId, heroId: hero.id } },
  });
  if (owned) throw new HttpError(409, `Player sudah memiliki hero ${hero.name}`);

  // 6. Saldo harus cukup
  const balance = currency === "BP" ? player.bp : player.diamond;
  if (balance < price) {
    throw new HttpError(400, `Saldo ${currency} tidak cukup (punya ${balance}, butuh ${price})`);
  }

  // Kurangi saldo dan catat kepemilikan dalam satu transaction:
  // kalau salah satu gagal, keduanya dibatalkan (saldo tidak hilang tanpa dapat hero)
  const [updatedPlayer] = await prisma.$transaction([
    prisma.player.update({
      where: { id: player.id },
      data: currency === "BP" ? { bp: { decrement: price } } : { diamond: { decrement: price } },
    }),
    prisma.playerHero.create({
      data: { playerId: player.id, heroId: hero.id, currency, pricePaid: price },
    }),
  ]);

  sendSuccess(res, 201, "Hero berhasil dibeli", {
    hero: { id: hero.id, name: hero.name },
    currency,
    pricePaid: price,
    balance: { bp: updatedPlayer.bp, diamond: updatedPlayer.diamond },
  });
};
