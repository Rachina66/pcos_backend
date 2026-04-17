import express from "express";
import * as cycleController from "../../controllers/cycle/cycle.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = express.Router();

router.use(authenticate);

// Daily logging
router.post("/log", cycleController.upsertDailyLog);
router.get("/log/range", cycleController.getDailyLogsInRange);
router.get("/log/:date", cycleController.getDailyLog);

// Cycles
router.get("/history", cycleController.getCycleHistory);
router.get("/prediction", cycleController.predictNextPeriod);

// Insights
router.get("/insights", cycleController.getInsights);

export default router;
