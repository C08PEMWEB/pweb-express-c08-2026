import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { sendSuccess } from "../utils/response";

export const getStatistics = async (_req: Request, res: Response): Promise<void> => {
  const totalPlayers = await prisma.player.count();

  const totalHeroesOwned = await prisma.playerHero.count();

  const diamondResult = await prisma.player.aggregate({
    _sum: { diamond: true },
  });
  const totalDiamond = diamondResult._sum.diamond ?? 0;

  const mostOwnedGroups = await prisma.playerHero.groupBy({
    by: ["heroId"],
    _count: { heroId: true },
    orderBy: [{ _count: { heroId: "desc" } }, { heroId: "asc" }],
    take: 1,
  });

  let mostOwnedHero: { heroId: number; name: string; owners: number } | null = null;
  if (mostOwnedGroups.length > 0) {
    const heroId = mostOwnedGroups[0].heroId;
    const hero = await prisma.hero.findUnique({ where: { id: heroId } });

    if (hero) {
      mostOwnedHero = {
        heroId,
        name: hero.name,
        owners: mostOwnedGroups[0]._count.heroId,
      };
    }
  }

  const roleGroups = await prisma.hero.groupBy({
    by: ["role"],
    _count: { role: true },
    orderBy: [{ _count: { role: "desc" } }, { role: "asc" }],
  });
  const heroesPerRole = roleGroups.map(({ role, _count }) => ({
    role,
    total: _count.role,
  }));

  sendSuccess(res, 200, "Berhasil mengambil statistik", {
    totalPlayers,
    totalHeroesOwned,
    totalDiamond,
    mostOwnedHero,
    heroesPerRole,
  });
};
