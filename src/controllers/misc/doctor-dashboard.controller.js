import prisma from "../../config/prismaclient.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse.utils.js";

// Get doctor's appointments
export const getMyAppointments = async (req, res) => {
  try {
    const doctorProfile = await prisma.doctor.findUnique({
      where: { email: req.user.email },
    });

    if (!doctorProfile) {
      return errorResponse(
        res,
        "Doctor profile not found. Please contact admin.",
        404,
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "asc" },
    });

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

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment) {
      return errorResponse(res, "Appointment not found", 404);
    }

    const doctorProfile = await prisma.doctor.findUnique({
      where: { email: req.user.email },
    });

    if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
      return errorResponse(
        res,
        "You can only update your own appointments",
        403,
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status, notes: notes || null },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

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
