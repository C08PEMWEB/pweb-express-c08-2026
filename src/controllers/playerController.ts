import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
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
