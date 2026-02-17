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

