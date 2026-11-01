// src/controllers/skinController.ts (B)
import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { Rarity } from "../generated/prisma/client";
import type { Prisma } from "../generated/prisma/client";
import { HttpError } from "../utils/http-error";
import { buildMetadata, getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

const rarities = Object.values(Rarity) as string[];

// GET /api/skins?page=&limit=&heroId=&rarity=
export const getAllSkins = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const { heroId, rarity } = req.query;

  const where: Prisma.SkinWhereInput = {};

  if (heroId !== undefined && heroId !== "") {
    where.heroId = parseId(heroId); // bukan angka positif -> otomatis 400
  }

  // Validasi dulu terhadap enum, kalau tidak Prisma akan error 500
  if (typeof rarity === "string" && rarity !== "") {
    if (!rarities.includes(rarity)) {
      throw new HttpError(400, `Rarity tidak valid. Pilihan: ${rarities.join(", ")}`);
    }
    where.rarity = rarity as Rarity;
  }

  const [skins, total] = await prisma.$transaction([
    prisma.skin.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
      include: { hero: { select: { name: true } } },
    }),
    prisma.skin.count({ where }),
  ]);

  sendSuccess(res, 200, "Berhasil mengambil data skin", skins, buildMetadata(page, limit, total));
};

// GET /api/skins/:skin_id
export const getSkinById = async (req: Request, res: Response) => {
  const id = parseId(req.params.skin_id);

  const skin = await prisma.skin.findUnique({
    where: { id },
    include: { hero: true },
  });
  if (!skin) throw new HttpError(404, "Skin tidak ditemukan");

  sendSuccess(res, 200, "Berhasil mengambil data skin", skin);
};
