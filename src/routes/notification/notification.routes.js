import express from "express";
import {
  getMyNotifications,
  getMyUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../controllers/notification/notification.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.get("/unread-count", getMyUnreadCount);
router.patch("/:id/read", markNotificationAsRead);
router.patch("/read-all", markAllNotificationsAsRead);

export default router;
