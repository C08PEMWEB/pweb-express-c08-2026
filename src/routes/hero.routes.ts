// src/routes/hero.routes.ts (B)
import { Router } from "express";
import { createHero, getAllHeroes, getHeroById } from "../controllers/heroController";

const router = Router();

// Didaftarkan di /api/heroes
router.get("/", getAllHeroes);
router.get("/:hero_id", getHeroById);
router.post("/", createHero);

export default router;
