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
