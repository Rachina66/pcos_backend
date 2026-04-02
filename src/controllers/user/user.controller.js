import * as userService from "../../services/user/user.service.js";
import * as doctorService from "../../services/public/public.service.js";
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

// ═══ PREDICTIONS ═══
export const createPrediction = async (req, res) => {
  try {
    const { data } = req.body;
    const userId = req.user.id;

    if (!data) {
      return errorResponse(res, "Prediction data is required", 400);
    }

    const prediction = await userService.createPrediction({
      userId,
      ...data,
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
    const { doctorId, date, timeSlot, reason } = req.body;
    const userId = req.user.id;

    if (!doctorId || !date || !timeSlot) {
      return errorResponse(
        res,
        "doctorId, date and timeSlot are required",
        400,
      );
    }

    // Check doctor exists
    const doctor = await doctorService.getDoctorById(doctorId);
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found");
    }

    // Check slot is not in the past
    if (isSlotInPast(date, timeSlot)) {
      return errorResponse(res, "This time slot has already passed", 400);
    }

    // Check slot is not already booked
    const slotTaken = await userService.isSlotTaken(doctorId, date, timeSlot);
    if (slotTaken) {
      return errorResponse(
        res,
        "This slot is already booked. Please choose another.",
        400,
      );
    }

    // Get report file if uploaded
    const reportFile = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const appointment = await userService.createAppointment({
      userId,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason: reason || null,
      reportFile,
    });
    sendBookingConfirmation(req.user.email, req.user.name, {
      doctorName: doctor.name,
      date: new Date(date).toDateString(),
      timeSlot,
      hospital: doctor.hospital,
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

    // Check appointment exists and belongs to user
    const appointment = await userService.getUserAppointmentById(id, userId);
    if (!appointment) {
      return notFoundResponse(res, "Appointment not found");
    }

    // Can only cancel PENDING or CONFIRMED
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return errorResponse(
        res,
        "Only pending or confirmed appointments can be cancelled",
        400,
      );
    }

    // Check cancellation deadline
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
