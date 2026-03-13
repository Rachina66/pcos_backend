import express from "express";
import * as adminController from "../../controllers/admin/admin.controller.js";
import {
  authenticate,
  authorize,
} from "../../middleware/authenticate.middleware.js";

const router = express.Router();

// All admin routes protected
router.use(authenticate, authorize(["ADMIN"]));

// ═══ DASHBOARD ═══
router.get("/stats", adminController.getDashboardStats);

// ═══ USER MANAGEMENT ═══
router.get("/users", adminController.getAllUsers);

// ═══ DOCTOR MANAGEMENT ═══
router.get("/doctors", adminController.getAllDoctors);
router.post("/doctors", adminController.createDoctor);
router.put("/doctors/:id", adminController.updateDoctor);
router.delete("/doctors/:id", adminController.deleteDoctor);

// ═══ CONTENT MANAGEMENT ═══
router.get("/content", adminController.getAllContent);
router.post("/content", adminController.createContent);
router.put("/content/:id", adminController.updateContent);
router.delete("/content/:id", adminController.deleteContent);

// ═══ APPOINTMENT MONITORING ═══
router.get("/appointments", adminController.getAllAppointments);
router.get("/appointments/:id/report", adminController.downloadReport);

export default router;
