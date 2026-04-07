import express from "express";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import * as profileController from "../../controllers/profile/profile.controller.js";
import {
  updateNameSchema,
  changePasswordSchema,
  changeEmailSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../../utils/validations/profile.schema.js";

const router = express.Router();

// ═══ AUTHENTICATED ROUTES (require login) ═══
router.put(
  "/name",
  authenticate,
  validate({ body: updateNameSchema }),
  profileController.updateName,
);

router.put(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  profileController.changePassword,
);

router.put(
  "/change-email",
  authenticate,
  validate({ body: changeEmailSchema }),
  profileController.changeEmail,
);

// ═══ PUBLIC ROUTES (no auth needed – forgot password flow) ═══
router.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  profileController.forgotPassword,
);

router.post(
  "/verify-otp",
  validate({ body: verifyOtpSchema }),
  profileController.verifyOtp,
);

router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  profileController.resetPassword,
);

export default router;
