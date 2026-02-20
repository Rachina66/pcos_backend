import express from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/authenticate.middleware.js";
import { uploadReport } from "../middleware/upload.middleware.js";

const router = express.Router();

// User routes
router.post(
  "/",
  authenticate,
  uploadReport,
  appointmentController.createAppointment,
);
router.get("/my", authenticate, appointmentController.getUserAppointments);

// Admin routes
router.get(
  "/all",
  authenticate,
  authorize(["ADMIN"]),
  appointmentController.getAllAppointments,
);
router.put(
  "/:id/status",
  authenticate,
  authorize(["ADMIN"]),
  appointmentController.updateAppointmentStatus,
);
router.get(
  "/:id/report",
  authenticate,
  authorize(["ADMIN"]),
  appointmentController.downloadReport,
);

export default router;
