// src/routes/index.ts
import { Router } from "express";
import { buyHero } from "../controllers/purchaseController";
import heroRouter from "./hero.routes";
import playerRouter from "./player.routes";
import skinRouter from "./skin.routes";
import statisticRouter from "./statistic.routes";

const router = Router();

router.use("/heroes", heroRouter);
router.use("/skins", skinRouter);
// Didaftarkan sebelum playerRouter supaya request ini tidak ditangkap router player
router.post("/players/:player_id/heroes", buyHero);
router.use("/players", playerRouter);
router.use("/statistics", statisticRouter);

export default router;
