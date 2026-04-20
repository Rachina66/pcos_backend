import * as userService from "../../services/user/user.service.js";
import * as doctorService from "../../services/public/public.service.js";
import { createNotification } from "../../services/notification/notification.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";
import {
  sendBookingConfirmation,
  sendCancellationToDoctor,
} from "../../utils/email.utils.js";
import {
  isSlotInPast,
  isCancellationTooLate,
} from "../../utils/appointment.utils.js";
import { io } from "../../../server.js";

// ═══ PREDICTIONS ═══
export const createPrediction = async (req, res) => {
  try {
    const { data } = req.body;
    const userId = req.user.id;

    if (!data) {
      return errorResponse(res, "Prediction data is required", 400);
    }

    const prediction = await userService.createPrediction({ userId, ...data });

    // ── Socket emit ──
    io.to("admin").emit("prediction:new", {
      predictionId: prediction.id,
      userId,
      riskLevel: prediction.riskLevel,
    });

    // ── Notification ──
    await createNotification({
      recipientRole: "ADMIN",
      type: "PREDICTION_NEW",
      title: "New PCOS Prediction",
      body: `A user submitted a new prediction. Risk level: ${prediction.riskLevel}`,
      data: {
        predictionId: prediction.id,
        userId,
        riskLevel: prediction.riskLevel,
      },
    });

    return successResponse(
      res,
      prediction,
      "Prediction created successfully",
      201,
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to create prediction",
      500,
      error.message,
    );
  }
};

export const getMyPredictions = async (req, res) => {
  try {
    const predictions = await userService.getUserPredictions(req.user.id);
    return successResponse(
      res,
      predictions,
      "Predictions fetched successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch predictions",
      500,
      error.message,
    );
  }
};

// ═══ APPOINTMENTS ═══
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, predictionId } = req.body;
    const userId = req.user.id;

    if (!doctorId || !date || !timeSlot) {
      return errorResponse(
        res,
        "doctorId, date and timeSlot are required",
        400,
      );
    }

    const doctor = await doctorService.getDoctorById(doctorId);
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found");
    }

    if (isSlotInPast(date, timeSlot)) {
      return errorResponse(res, "This time slot has already passed", 400);
    }

    const slotTaken = await userService.isSlotTaken(doctorId, date, timeSlot);
    if (slotTaken) {
      return errorResponse(
        res,
        "This slot is already booked. Please choose another.",
        400,
      );
    }

    if (predictionId) {
      const prediction = await userService.getPredictionById(predictionId);
      if (!prediction || prediction.userId !== userId) {
        return errorResponse(res, "Invalid prediction", 400);
      }
    }

    const reportFile = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const appointment = await userService.createAppointment({
      userId,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason: reason || null,
      reportFile,
      predictionId: predictionId || null,
    });

    sendBookingConfirmation(req.user.email, req.user.name, {
      doctorName: doctor.name,
      date: new Date(date).toDateString(),
      timeSlot,
      hospital: doctor.hospital,
    });

    const appointmentPayload = {
      appointmentId: appointment.id,
      patientName: req.user.name,
      date: new Date(date).toDateString(),
      timeSlot,
    };

    // ── Socket emits ──
    console.log("[Socket] rooms available:", [
      ...io.sockets.adapter.rooms.keys(),
    ]);
    console.log("[Socket] emitting to:", `doctor:${doctorId}`);
    console.log("[Socket] doctorId from request:", doctorId);

    io.to(`doctor:${doctorId}`).emit("appointment:new", appointmentPayload);
    io.to("admin").emit("appointment:new", appointmentPayload);
    // ── Notifications ──
    await createNotification({
      doctorId,
      recipientRole: "DOCTOR",
      type: "APPOINTMENT_NEW",
      title: "New Appointment Booked",
      body: `${req.user.name} booked an appointment on ${new Date(date).toDateString()} at ${timeSlot}`,
      data: {
        appointmentId: appointment.id,
        patientName: req.user.name,
        date: new Date(date).toDateString(),
        timeSlot,
      },
    });

    await createNotification({
      recipientRole: "ADMIN",
      type: "APPOINTMENT_NEW",
      title: "New Appointment",
      body: `${req.user.name} booked with Dr. ${doctor.name} on ${new Date(date).toDateString()} at ${timeSlot}`,
      data: {
        appointmentId: appointment.id,
        patientName: req.user.name,
        doctorName: doctor.name,
        date: new Date(date).toDateString(),
        timeSlot,
      },
    });

    return successResponse(
      res,
      appointment,
      "Appointment booked successfully",
      201,
    );
  } catch (error) {
    return errorResponse(res, "Failed to book appointment", 500, error.message);
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await userService.getUserAppointments(req.user.id);
    return successResponse(
      res,
      appointments,
      "Appointments fetched successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch appointments",
      500,
      error.message,
    );
  }
};

// ═══ CANCEL APPOINTMENT ═══
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await userService.getUserAppointmentById(id, userId);
    if (!appointment) {
      return notFoundResponse(res, "Appointment not found");
    }

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return errorResponse(
        res,
        "Only pending or confirmed appointments can be cancelled",
        400,
      );
    }

    if (isCancellationTooLate(appointment.date, appointment.timeSlot)) {
      return errorResponse(
        res,
        "Cannot cancel appointment less than 2 hours before scheduled time",
        400,
      );
    }

    const cancelled = await userService.cancelAppointment(id);

    sendCancellationToDoctor(
      appointment.doctor.email,
      appointment.doctor.name,
      {
        patientName: req.user.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
      },
    );

    // ── Socket emits ──
    io.to(`doctor:${appointment.doctorId}`).emit(
      "appointment:cancelled_by_user",
      {
        appointmentId: id,
        patientName: req.user.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
      },
    );
    io.to("admin").emit("appointment:cancelled_by_user", { appointmentId: id });

    // ── Notifications ──
    await createNotification({
      doctorId: appointment.doctorId,
      recipientRole: "DOCTOR",
      type: "APPOINTMENT_CANCELLED",
      title: "Appointment Cancelled",
      body: `${req.user.name} cancelled their appointment on ${appointment.date.toDateString()} at ${appointment.timeSlot}`,
      data: {
        appointmentId: id,
        patientName: req.user.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
      },
    });

    await createNotification({
      recipientRole: "ADMIN",
      type: "APPOINTMENT_CANCELLED",
      title: "Appointment Cancelled",
      body: `${req.user.name} cancelled with Dr. ${appointment.doctor.name} on ${appointment.date.toDateString()} at ${appointment.timeSlot}`,
      data: {
        appointmentId: id,
        patientName: req.user.name,
        doctorName: appointment.doctor.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
      },
    });

    return successResponse(
      res,
      cancelled,
      "Appointment cancelled successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to cancel appointment",
      500,
      error.message,
    );
  }
};
