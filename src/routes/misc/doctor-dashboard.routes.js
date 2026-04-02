import express from "express";
import * as doctorDashboardController from "../controllers/doctor-dashboard.controller.js";
import {
  authenticate,
  authorize,
} from "../../middleware/authenticate.middleware.js";

const router = express.Router();

router.use(authenticate, authorize(["DOCTOR"]));

router.get("/appointments", doctorDashboardController.getMyAppointments);
router.put(
  "/appointments/:id",
  doctorDashboardController.updateAppointmentStatus,
);

export default router;

