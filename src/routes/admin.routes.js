import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/authenticate.middleware.js";

const router = express.Router();

// All admin routes protected
router.use(authenticate, authorize(["ADMIN"]));

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);

export default router;
