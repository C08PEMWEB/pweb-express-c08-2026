// src/controllers/purchaseController.ts (A)
import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error";

// POST /api/players/:player_id/heroes (Fitur 6, diisi di langkah A7)
export const buyHero = async (_req: Request, _res: Response) => {
  throw new HttpError(501, "Fitur beli hero belum dibuat");
};
