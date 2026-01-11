import express from "express";
import authRoutes from "./auth/index.js";
// Future modules can be added like:
// import userRoutes from "./user/index.js";
// import mealRoutes from "./meal/index.js";
// import pcosRoutes from "./pcos/index.js";

const router = express.Router();

// Mount Auth module
router.use("/auth", authRoutes);

// Example placeholders for future modules
// router.use("/user", userRoutes);
// router.use("/meal", mealRoutes);
// router.use("/pcos", pcosRoutes);

// Optional: health check for API
router.get("/", (req, res) => {
  res.json({ message: "PCOS Backend API running!" });
});

export default router;
// /auth/login
// /auth/register