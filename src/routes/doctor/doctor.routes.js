import express from "express";
import * as doctorController from "../../controllers/doctor/doctor.controller.js";
import {
  authenticate,
  authorize,
} from "../../middleware/authenticate.middleware.js";

const router = express.Router();

// All doctor routes protected
router.use(authenticate, authorize(["DOCTOR"]));

// ═══ PROFILE MANAGEMENT ═══
router.get("/profile", doctorController.getMyProfile);
router.put("/profile", doctorController.updateMyProfile);
router.put("/availability", doctorController.updateMyAvailability);

// ═══ DASHBOARD ═══
router.get("/stats", doctorController.getDashboardStats);

// ═══ APPOINTMENTS ═══
router.get("/appointments", doctorController.getMyAppointments);
router.get("/appointments/today", doctorController.getTodayAppointments);
router.get("/appointments/upcoming", doctorController.getUpcomingAppointments);
router.get("/appointments/past", doctorController.getPastAppointments);
router.put(
  "/appointments/bulk-confirm",
  doctorController.bulkConfirmAppointments,
);
router.put("/appointments/:id", doctorController.updateAppointmentStatus);
router.put("/appointments/:id/notes", doctorController.addConsultationNotes);
router.get("/appointments/:id/report", doctorController.downloadPatientReport);

// ═══ PATIENTS ═══
router.get("/patients", doctorController.getMyPatients);
router.get("/patients/:userId", doctorController.getPatientById);
router.get(
  "/patients/:userId/appointments",
  doctorController.getPatientAppointments,
);
router.get(
  "/patients/:userId/predictions",
  doctorController.getPatientPredictions,
);

export default router;
