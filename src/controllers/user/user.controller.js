import * as userService from "../../services/user/user.service.js";
import * as doctorService from "../../services/public/public.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";

// ═══ PREDICTIONS ═══
export const createPrediction = async (req, res) => {
  try {
    const { data } = req.body;
    const userId = req.user.id;

    // Validate required fields (add your validation)
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

    // Verify doctor exists (using public service)
    const doctor = await doctorService.getDoctorById(doctorId);
    if (!doctor) {
      return notFoundResponse(res, "Doctor not found");
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
