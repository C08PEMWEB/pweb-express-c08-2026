import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

export const createPlayer = async (req: Request, res: Response): Promise<void> => {
  const body = req.body ?? {};
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";

  if (!nickname) {
    throw new HttpError(400, "Nickname tidak boleh kosong");
  }

  const player = await prisma.player.create({
    data: { nickname },
  });

  sendSuccess(res, 201, "Player berhasil dibuat", player);
};

export const getPlayerById = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.player_id);

  const player = await prisma.player.findUnique({
    where: { id },
    include: { heroes: { include: { hero: true } } },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const data = {
    ...player,
    heroes: player.heroes.map(({ hero, currency, pricePaid }) => ({
      heroId: hero.id,
      name: hero.name,
      currency,
      pricePaid,
    })),
  };

  sendSuccess(res, 200, "Berhasil mengambil data player", data);
};

export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.player_id);

  const existingPlayer = await prisma.player.findUnique({ where: { id } });
  if (!existingPlayer) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const body = req.body ?? {};
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  if (!nickname) {
    throw new HttpError(400, "Nickname tidak boleh kosong");
  }

  const player = await prisma.player.update({
    where: { id },
    data: { nickname },
  });

  sendSuccess(res, 200, "Player berhasil diperbarui", player);
};

export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.player_id);

  const existingPlayer = await prisma.player.findUnique({ where: { id } });
  if (!existingPlayer) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  await prisma.player.delete({ where: { id } });

  sendSuccess(res, 200, "Player berhasil dihapus", {
    id: existingPlayer.id,
    nickname: existingPlayer.nickname,
  });
};

export const topUp = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.player_id);

  const body = req.body ?? {};
  const amount = body.amount;
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "Amount harus berupa bilangan bulat lebih dari 0");
  }

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: { diamond: { increment: amount } },
  });

  sendSuccess(res, 200, "Top up berhasil", {
    playerId: id,
    amount,
    diamond: updatedPlayer.diamond,
  });
};

export const playMatch = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.player_id);

  const body = req.body ?? {};
  const result = body.result;
  if (result !== "WIN" && result !== "LOSE") {
    throw new HttpError(400, "Result harus WIN atau LOSE");
  }

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const bpEarned = result === "WIN" ? 300 : 100;
  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: { bp: { increment: bpEarned } },
  });

  sendSuccess(res, 200, "Hadiah match berhasil ditambahkan", {
    playerId: id,
    result,
    bpEarned,
    bp: updatedPlayer.bp,
  });
};
