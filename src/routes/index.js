import express from "express";
import authRoutes from "./auth/index.js";
import predictionRoutes from "./prediction.routes.js";
import userRoutes from "./user/user.routes.js";
import publicRoutes from "./public/public.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import doctorRoutes from "./doctor/doctor.routes.js";
import cycleRoutes from "./cycle/cycle.routes.js";
import profileRoutes from "./profile/profile.routes.js";
import mealRoutes from "./meal/meal.routes.js";
import notificationRoutes from "./notification/notification.routes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ message: "PCOS Backend API running" });
});

router.use("/auth", authRoutes);
router.use("/prediction", predictionRoutes);
router.use("/profile", profileRoutes);
router.use("/user", userRoutes);
router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);
router.use("/doctor", doctorRoutes);
router.use("/user/cycles", cycleRoutes);
router.use("/meal-plan", mealRoutes);
router.use("/notifications", notificationRoutes); // ← THIS WAS MISSING

export default router;
