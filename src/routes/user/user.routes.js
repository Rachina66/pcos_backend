import express from "express";
import * as userController from "../../controllers/user/user.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { uploadReport } from "../../middleware/upload.middleware.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// ═══ PREDICTIONS ═══
router.post("/predictions", userController.createPrediction);
router.get("/predictions", userController.getMyPredictions);

// ═══ APPOINTMENTS ═══
router.post("/appointments", uploadReport, userController.bookAppointment);
router.get("/appointments", userController.getMyAppointments);
router.delete("/appointments/:id", userController.cancelAppointment);
export default router;
