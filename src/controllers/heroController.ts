// src/controllers/heroController.ts (B)
import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { Lane, Role } from "../generated/prisma/client";
import type { Prisma } from "../generated/prisma/client";
import { HttpError } from "../utils/http-error";
import { buildMetadata, getPagination } from "../utils/pagination";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

const roles = Object.values(Role) as string[];
const lanes = Object.values(Lane) as string[];

// Harga boleh kosong (null). Kalau diisi, harus bilangan bulat >= 0
const parsePrice = (value: unknown, field: string): number | null => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new HttpError(400, `${field} harus berupa bilangan bulat 0 atau lebih`);
  }
  return value;
};

// GET /api/heroes?page=&limit=&search=&role=
export const getAllHeroes = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, role } = req.query;

  const where: Prisma.HeroWhereInput = {};

  if (typeof search === "string" && search.trim() !== "") {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  // Validasi dulu terhadap enum, kalau tidak Prisma akan error 500
  if (typeof role === "string" && role !== "") {
    if (!roles.includes(role)) {
      throw new HttpError(400, `Role tidak valid. Pilihan: ${roles.join(", ")}`);
    }
    where.role = role as Role;
  }

  // findMany + count dalam satu transaksi
  const [heroes, total] = await prisma.$transaction([
    prisma.hero.findMany({ where, skip, take: limit, orderBy: { id: "asc" } }),
    prisma.hero.count({ where }),
  ]);

  sendSuccess(res, 200, "Berhasil mengambil data hero", heroes, buildMetadata(page, limit, total));
};

// GET /api/heroes/:hero_id
export const getHeroById = async (req: Request, res: Response) => {
  const id = parseId(req.params.hero_id);

  const hero = await prisma.hero.findUnique({
    where: { id },
    include: { skins: true },
  });
  if (!hero) throw new HttpError(404, "Hero tidak ditemukan");

  sendSuccess(res, 200, "Berhasil mengambil data hero", hero);
};

// POST /api/heroes
export const createHero = async (req: Request, res: Response) => {
  const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body ?? {};

  // 1. Field wajib kosong -> 400
  if (typeof name !== "string" || name.trim() === "" || !role || !lane || releaseYear === undefined || releaseYear === null || releaseYear === "") {
    throw new HttpError(400, "name, role, lane, dan releaseYear wajib diisi");
  }
  if (!roles.includes(role)) {
    throw new HttpError(400, `Role tidak valid. Pilihan: ${roles.join(", ")}`);
  }
  if (!lanes.includes(lane)) {
    throw new HttpError(400, `Lane tidak valid. Pilihan: ${lanes.join(", ")}`);
  }
  if (typeof releaseYear !== "number" || !Number.isInteger(releaseYear)) {
    throw new HttpError(400, "releaseYear harus berupa bilangan bulat");
  }

  const hargaBP = parsePrice(priceBP, "priceBP");
  const hargaDiamond = parsePrice(priceDiamond, "priceDiamond");
  const heroName = name.trim();

  // 2. Nama sudah ada -> 409
  const existing = await prisma.hero.findUnique({ where: { name: heroName } });
  if (existing) throw new HttpError(409, `Hero ${heroName} sudah ada`);

  // 3. Berhasil -> 201
  const hero = await prisma.hero.create({
    data: {
      name: heroName,
      role,
      lane,
      releaseYear,
      priceBP: hargaBP,
      priceDiamond: hargaDiamond,
    },
  });

  sendSuccess(res, 201, "Hero berhasil dibuat", hero);
};
