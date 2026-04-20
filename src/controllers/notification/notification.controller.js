import prisma from "../../config/prismaclient.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../services/notification/notification.service.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse.utils.js";

// ── Helper: get Doctor.id from email ──
const getDoctorId = async (email) => {
  const doctor = await prisma.doctor.findUnique({
    where: { email },
    select: { id: true },
  });
  return doctor?.id ?? null;
};

// ── GET /notifications ──
export const getMyNotifications = async (req, res) => {
  try {
    const { role } = req.user;

    if (role === "DOCTOR") {
      const doctorId = await getDoctorId(req.user.email);
      if (!doctorId) return errorResponse(res, "Doctor profile not found", 404);
      const notifications = await getNotifications({
        doctorId,
        recipientRole: "DOCTOR",
      });
      return successResponse(
        res,
        notifications,
        "Notifications fetched successfully",
      );
    }

    if (role === "USER") {
      const notifications = await getNotifications({
        userId: req.user.id,
        recipientRole: "USER",
      });
      return successResponse(
        res,
        notifications,
        "Notifications fetched successfully",
      );
    }

    // ADMIN
    const notifications = await getNotifications({ recipientRole: "ADMIN" });
    return successResponse(
      res,
      notifications,
      "Notifications fetched successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch notifications",
      500,
      error.message,
    );
  }
};

// ── GET /notifications/unread-count ──
export const getMyUnreadCount = async (req, res) => {
  try {
    const { role } = req.user;

    if (role === "DOCTOR") {
      const doctorId = await getDoctorId(req.user.email);
      if (!doctorId) return errorResponse(res, "Doctor profile not found", 404);
      const count = await getUnreadCount({ doctorId, recipientRole: "DOCTOR" });
      return successResponse(
        res,
        { count },
        "Unread count fetched successfully",
      );
    }

    if (role === "USER") {
      const count = await getUnreadCount({
        userId: req.user.id,
        recipientRole: "USER",
      });
      return successResponse(
        res,
        { count },
        "Unread count fetched successfully",
      );
    }

    // ADMIN
    const count = await getUnreadCount({ recipientRole: "ADMIN" });
    return successResponse(res, { count }, "Unread count fetched successfully");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch unread count",
      500,
      error.message,
    );
  }
};

// ── PATCH /notifications/:id/read ──
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markAsRead(id);
    return successResponse(res, notification, "Notification marked as read");
  } catch (error) {
    return errorResponse(res, "Failed to mark as read", 500, error.message);
  }
};

// ── PATCH /notifications/read-all ──
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { role } = req.user;

    if (role === "DOCTOR") {
      const doctorId = await getDoctorId(req.user.email);
      if (!doctorId) return errorResponse(res, "Doctor profile not found", 404);
      await markAllAsRead({ doctorId, recipientRole: "DOCTOR" });
      return successResponse(res, null, "All notifications marked as read");
    }

    if (role === "USER") {
      await markAllAsRead({ userId: req.user.id, recipientRole: "USER" });
      return successResponse(res, null, "All notifications marked as read");
    }

    // ADMIN
    await markAllAsRead({ recipientRole: "ADMIN" });
    return successResponse(res, null, "All notifications marked as read");
  } catch (error) {
    return errorResponse(res, "Failed to mark all as read", 500, error.message);
  }
};
