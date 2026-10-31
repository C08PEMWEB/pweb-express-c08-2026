// src/routes/player.routes.ts (C)
import { Router } from "express";
import { createPlayer, getPlayerById, updatePlayer, deletePlayer } from "../controllers/playerController";

const router = Router();

router.post("/", createPlayer);
router.get("/:player_id", getPlayerById);
router.patch("/:player_id", updatePlayer);
router.delete("/:player_id", deletePlayer);

// Didaftarkan di /api/players. Isi oleh C:
// POST   /                    -> createPlayer
// GET    /:player_id          -> getPlayerById
// PATCH  /:player_id          -> updatePlayer
// DELETE /:player_id          -> deletePlayer
// POST   /:player_id/topup    -> topUp
// POST   /:player_id/matches  -> playMatch
// (POST /:player_id/heroes milik A, sudah didaftarkan di routes/index.ts)

export default router;
