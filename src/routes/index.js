import express from "express";
import authRoutes from "./auth/index.js";
import predictionRoutes from "./prediction.routes.js";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({ message: "PCOS Backend API running" });
});

// Mount Auth module
router.use("/auth", authRoutes);

// Mount Prediction module under /prediction
router.use("/prediction", predictionRoutes);

export default router;

// Final Endpoints:
// POST   /api/auth/register
// POST   /api/auth/login
// POST   /api/prediction/predict
// GET    /api/prediction/predictions/:userId
// GET    /api/health



// Example placeholders for future modules
// router.use("/user", userRoutes);
// router.use("/meal", mealRoutes);
// router.use("/pcos", pcosRoutes);