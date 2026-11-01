// src/routes/skin.routes.ts (B)
import { Router } from "express";
import { getAllSkins, getSkinById } from "../controllers/skinController";

const router = Router();

// Didaftarkan di /api/skins
router.get("/", getAllSkins);
router.get("/:skin_id", getSkinById);

export default router;
