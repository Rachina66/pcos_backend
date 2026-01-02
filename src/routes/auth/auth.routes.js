import express from "express";
import { validate } from "../../middleware/validate.js";
import authController from "../../controllers/auth/auth.controller.js";
import {
  registerSchema,
  loginSchema,
} from "../../utils/validations/auth.schema.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register
);
router.post("/login", validate({ body: loginSchema }), authController.login);

// Protected route: user profile
router.get("/profile", authenticate, authController.profile);

// Admin-only route example
router.get(
  "/admin/dashboard",
  authenticate,
  authorize(["ADMIN"]),
  (req, res) => {
    res.send("Welcome Admin!");
  }
);

export default router;
