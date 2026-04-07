import express from "express";
import authRoutes from "./auth/index.js";
import predictionRoutes from "./prediction.routes.js";
// import doctorRoutes from "./doctor.routes.js";
// import appointmentRoutes from "./misc/appointment.routes.js";
// import adminRoutes from "./admin.routes.js";
// import doctorDashboardRoutes from "./doctor-dashboard.routes.js";
import userRoutes from "./user/user.routes.js";
import publicRoutes from "./public/public.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import doctorRoutes from "./doctor/doctor.routes.js";
import cycleRoutes from "./cycle/cycle.routes.js";
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
// router.use("/doctors", doctorRoutes);
// router.use("/appointments", appointmentRoutes);
// router.use("/admin", adminRoutes);
// router.use("/doctor", doctorDashboardRoutes);

//routes for user
router.use("/user", userRoutes);

//public routes
router.use("/public", publicRoutes);

//admin routes
router.use("/admin", adminRoutes);

//doctor routes
router.use("/doctor", doctorRoutes);

//cycle routes
router.use("/user/cycles", cycleRoutes);

export default router;
