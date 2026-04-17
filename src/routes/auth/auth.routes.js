import express from "express";
import { validate } from "../../middleware/validate.js";
import {
  register,
  login,
  profile,
  registerDoctor,
  verifyEmail,
} from "../../controllers/auth/auth.controller.js";
import {
  registerSchema,
  loginSchema,
} from "../../utils/validations/auth.schema.js";
import {
  authenticate,
  authorize,
} from "../../middleware/authenticate.middleware.js";

const router = express.Router();

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", validate({ body: loginSchema }), login);
router.post("/verify-email", verifyEmail); // ← ADD (no auth needed)
router.get("/profile", authenticate, profile);
router.get(
  "/admin/dashboard",
  authenticate,
  authorize(["ADMIN"]),
  (req, res) => {
    res.send("Welcome Admin");
  },
);
router.post(
  "/register-doctor",
  authenticate,
  authorize(["ADMIN"]),
  registerDoctor,
);

export default router;
