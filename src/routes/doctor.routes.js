import express from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { authenticate, authorize } from "../middleware/authenticate.middleware.js";

const router = express.Router();

// Public routes (users can view doctors)
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);

// Admin only routes
router.post("/", authenticate, authorize(["ADMIN"]), doctorController.createDoctor);
router.put("/:id", authenticate, authorize(["ADMIN"]), doctorController.updateDoctor);
router.delete("/:id", authenticate, authorize(["ADMIN"]), doctorController.deleteDoctor);

export default router;