import express from "express";
import * as publicController from "../../controllers/public/public.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = express.Router();

// ALL public routes require login (but any role can access)
router.use(authenticate);

// ═══ DOCTORS (All logged-in users see same) ═══
router.get("/doctors", publicController.getAllDoctors);
router.get("/doctors/:id", publicController.getDoctorById);
router.get("/doctors/:id/available-slots", publicController.getAvailableSlots);

// ═══ EDUCATIONAL CONTENT (All logged-in users see same) ═══
router.get("/content", publicController.getAllContent);
router.get("/content/:id", publicController.getContentById);

export default router;
