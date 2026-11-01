// src/routes/statistic.routes.ts (C)
import { Router } from "express";
import { getStatistics } from "../controllers/statisticController";

const router = Router();

// Didaftarkan di /api/statistics. Isi oleh C:
// GET / -> getStatistics
router.get("/", getStatistics);

export default router;
