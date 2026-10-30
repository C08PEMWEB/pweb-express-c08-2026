// src/routes/player.routes.ts (C)
import { Router } from "express";
import { createPlayer } from "../controllers/playerController";

const router = Router();

router.post("/", createPlayer);

// Didaftarkan di /api/players. Isi oleh C:
// POST   /                    -> createPlayer
// GET    /:player_id          -> getPlayerById
// PATCH  /:player_id          -> updatePlayer
// DELETE /:player_id          -> deletePlayer
// POST   /:player_id/topup    -> topUp
// POST   /:player_id/matches  -> playMatch
// (POST /:player_id/heroes milik A, sudah didaftarkan di routes/index.ts)

export default router;
