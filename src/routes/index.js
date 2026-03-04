import express from "express";
import authRoutes from "./auth/index.js";
import predictionRoutes from "./prediction.routes.js";
import doctorRoutes from "./doctor.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import adminRoutes from "./admin.routes.js";
import doctorDashboardRoutes from "./doctor-dashboard.routes.js";
const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({ message: "PCOS Backend API running" });
});

// Mount Auth module
router.use("/auth", authRoutes);

// Mount Prediction module
router.use("/prediction", predictionRoutes);

// Mount admin feature routes
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/admin", adminRoutes);
router.use("/doctor", doctorDashboardRoutes);

export default router;
