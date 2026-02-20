import * as appointmentService from "../services/appointment.service.js";
import * as doctorService from "../services/doctor.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/apiResponse.utils.js";
import path from "path";

// POST /api/appointments - User books appointment
export const createAppointment = async (req, res) => {
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
    if (!doctor) return notFoundResponse(res, "Doctor not found");

    // Get report file path if uploaded
    const reportFile = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const appointment = await appointmentService.createAppointment({
      userId,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason: reason || null,
      reportFile,
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

// GET /api/appointments/my - User views own appointments
export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getUserAppointments(
      req.user.id,
    );
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

// GET /api/admin/appointments - Admin views all
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    return successResponse(res, appointments, "All appointments fetched");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch appointments",
      500,
      error.message,
    );
  }
};

// PUT /api/admin/appointments/:id - Admin confirms/cancels
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const appointment = await appointmentService.getAppointmentById(
      req.params.id,
    );
    if (!appointment) return notFoundResponse(res, "Appointment not found");

    const updated = await appointmentService.updateAppointmentStatus(
      req.params.id,
      status,
      notes,
    );

    return successResponse(
      res,
      updated,
      `Appointment ${status.toLowerCase()} successfully`,
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to update appointment",
      500,
      error.message,
    );
  }
};

// GET /api/admin/appointments/:id/report - Admin downloads report
export const downloadReport = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id,
    );
    if (!appointment) return notFoundResponse(res, "Appointment not found");
    if (!appointment.reportFile) {
      return errorResponse(res, "No report attached", 404);
    }

    const filePath = path.resolve(appointment.reportFile);
    return res.download(filePath);
  } catch (error) {
    return errorResponse(res, "Failed to download report", 500, error.message);
  }
};
