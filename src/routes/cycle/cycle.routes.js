import express from "express";
import * as cycleController from "../../controllers/cycle/cycle.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = express.Router();

router.use(authenticate);

// ═══ CYCLE LOGS ═══
router.post("/", cycleController.logPeriod);
router.get("/", cycleController.getCycleHistory);
router.get("/latest", cycleController.getLatestCycle);
router.put("/:id", cycleController.updateCycleLog);
router.delete("/:id", cycleController.deleteCycleLog);

// ═══ PREDICTION ═══
router.get("/prediction", cycleController.predictNextPeriod);

// ═══ SYMPTOMS ═══
router.post("/symptoms", cycleController.logSymptoms);
router.get("/symptoms/today", cycleController.getTodaySymptoms);
router.get("/symptoms/insights", cycleController.getSymptomInsights);

export default router;
