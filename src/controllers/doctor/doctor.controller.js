import * as doctorService from "../../services/doctor/doctor.service.js";
import { createNotification } from "../../services/notification/notification.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";
import path from "path";
import {
  sendAppointmentConfirmed,
  sendAppointmentRejected,
  sendAppointmentCompleted,
} from "../../utils/email.utils.js";
import { io } from "../../../server.js";

// ═══ HELPER — get doctor profile or return error ═══
const getDoctorProfileOrError = async (res, email) => {
  const doctorProfile = await doctorService.getDoctorProfileByEmail(email);
  if (!doctorProfile) {
    errorResponse(res, "Doctor profile not found", 404);
    return null;
  }
  return doctorProfile;
};

// ═══ PROFILE MANAGEMENT ═══
export const getMyProfile = async (req, res) => {
  try {
    const profile = await doctorService.getDoctorProfileByEmail(req.user.email);
    if (!profile) return errorResponse(res, "Doctor profile not found", 404);
    return successResponse(res, profile, "Profile fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch profile", 500, error.message);
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.availableDays) {
      updateData.availableDays = Array.isArray(updateData.availableDays)
        ? updateData.availableDays
        : updateData.availableDays.split(",").map((d) => d.trim());
    }

    if (updateData.timeSlots) {
      updateData.timeSlots = Array.isArray(updateData.timeSlots)
        ? updateData.timeSlots
        : updateData.timeSlots.split(",").map((t) => t.trim());
    }

    if (updateData.experience)
      updateData.experience = Number(updateData.experience);
    if (updateData.consultFee)
      updateData.consultFee = Number(updateData.consultFee);

    delete updateData.email;

    const updated = await doctorService.updateDoctorProfile(
      req.user.email,
      updateData,
    );
    return successResponse(res, updated, "Profile updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update profile", 500, error.message);
  }
};

export const updateMyAvailability = async (req, res) => {
  try {
    const { availableDays, timeSlots } = req.body;

    if (!availableDays && !timeSlots) {
      return errorResponse(
        res,
        "At least one of availableDays or timeSlots is required",
        400,
      );
    }

    const updateData = {};

    if (availableDays) {
      updateData.availableDays = Array.isArray(availableDays)
        ? availableDays
        : availableDays.split(",").map((d) => d.trim());
    }

    if (timeSlots) {
      updateData.timeSlots = Array.isArray(timeSlots)
        ? timeSlots
        : timeSlots.split(",").map((t) => t.trim());
    }

    const updated = await doctorService.updateDoctorProfile(
      req.user.email,
      updateData,
    );

    io.emit("doctor:availability_updated", {
      doctorId: updated.id,
      availableSlots: updated.timeSlots,
    });

    return successResponse(res, updated, "Availability updated successfully");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to update availability",
      500,
      error.message,
    );
  }
};

// ═══ DASHBOARD STATS ═══
export const getDashboardStats = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const stats = await doctorService.getDoctorStats(doctorProfile.id);
    return successResponse(res, stats, "Stats fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch stats", 500, error.message);
  }
};

// ═══ APPOINTMENT MANAGEMENT ═══
export const getMyAppointments = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const { status, date } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (date) filters.date = date;

    const appointments = await doctorService.getDoctorAppointments(
      doctorProfile.id,
      filters,
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

export const getTodayAppointments = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const appointments = await doctorService.getTodayAppointments(
      doctorProfile.id,
    );
    return successResponse(
      res,
      appointments,
      "Today's appointments fetched successfully",
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

export const getUpcomingAppointments = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const appointments = await doctorService.getUpcomingAppointments(
      doctorProfile.id,
    );
    return successResponse(
      res,
      appointments,
      "Upcoming appointments fetched successfully",
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

export const getPastAppointments = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const appointments = await doctorService.getPastAppointments(
      doctorProfile.id,
    );
    return successResponse(
      res,
      appointments,
      "Past appointments fetched successfully",
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

// ═══ UPDATE APPOINTMENT STATUS ═══
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const allowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(
        res,
        "Invalid status. Doctor can only confirm, cancel or complete appointments.",
        400,
      );
    }

    const appointment = await doctorService.getAppointmentById(req.params.id);
    if (!appointment) return errorResponse(res, "Appointment not found", 404);

    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    if (appointment.doctorId !== doctorProfile.id) {
      return errorResponse(
        res,
        "You can only update your own appointments",
        403,
      );
    }

    if (status === "CONFIRMED" && appointment.status !== "PENDING") {
      return errorResponse(
        res,
        "Only pending appointments can be confirmed",
        400,
      );
    }

    if (status === "COMPLETED" && appointment.status !== "CONFIRMED") {
      return errorResponse(
        res,
        "Only confirmed appointments can be marked as completed",
        400,
      );
    }

    if (
      status === "CANCELLED" &&
      !["PENDING", "CONFIRMED"].includes(appointment.status)
    ) {
      return errorResponse(
        res,
        "Only pending or confirmed appointments can be cancelled",
        400,
      );
    }

    if (status === "COMPLETED" && !notes) {
      return errorResponse(
        res,
        "Please add consultation notes before marking as completed",
        400,
      );
    }

    const updated = await doctorService.updateAppointmentStatus(
      req.params.id,
      status,
      notes,
    );

    // ── Socket emits ──
    io.to(`user:${appointment.userId}`).emit("appointment:status_updated", {
      appointmentId: req.params.id,
      status,
      doctorName: doctorProfile.name,
      date: appointment.date.toDateString(),
      timeSlot: appointment.timeSlot,
      notes: notes || null,
    });
    io.to("admin").emit("appointment:status_updated", {
      appointmentId: req.params.id,
      status,
    });

    // ── Notifications ──
    const statusLabels = {
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
      COMPLETED: "Completed",
    };

    await createNotification({
      userId: appointment.userId,
      recipientRole: "USER",
      type: `APPOINTMENT_${status}`,
      title: `Appointment ${statusLabels[status]}`,
      body: `Dr. ${doctorProfile.name} ${status.toLowerCase()} your appointment on ${appointment.date.toDateString()} at ${appointment.timeSlot}${notes ? `. Note: ${notes}` : ""}`,
      data: {
        appointmentId: req.params.id,
        status,
        doctorName: doctorProfile.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
      },
    });

    await createNotification({
      recipientRole: "ADMIN",
      type: `APPOINTMENT_${status}`,
      title: `Appointment ${statusLabels[status]}`,
      body: `Dr. ${doctorProfile.name} ${status.toLowerCase()} appointment with ${appointment.user.name} on ${appointment.date.toDateString()}`,
      data: {
        appointmentId: req.params.id,
        status,
        doctorName: doctorProfile.name,
        patientName: appointment.user.name,
      },
    });

    // ── Emails ──
    if (status === "CONFIRMED") {
      sendAppointmentConfirmed(appointment.user.email, appointment.user.name, {
        doctorName: doctorProfile.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
        hospital: doctorProfile.hospital,
      });
    }

    if (status === "CANCELLED") {
      sendAppointmentRejected(
        appointment.user.email,
        appointment.user.name,
        {
          doctorName: doctorProfile.name,
          date: appointment.date.toDateString(),
          timeSlot: appointment.timeSlot,
        },
        notes,
      );
    }

    if (status === "COMPLETED") {
      sendAppointmentCompleted(appointment.user.email, appointment.user.name, {
        doctorName: doctorProfile.name,
        date: appointment.date.toDateString(),
        timeSlot: appointment.timeSlot,
      });
    }

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

// ═══ ADD CONSULTATION NOTES ═══
export const addConsultationNotes = async (req, res) => {
  try {
    const { consultationNotes, prescription, diagnosis } = req.body;

    if (!consultationNotes && !prescription && !diagnosis) {
      return errorResponse(
        res,
        "At least one field (consultationNotes, prescription, diagnosis) is required",
        400,
      );
    }

    const appointment = await doctorService.getAppointmentById(req.params.id);
    if (!appointment) return errorResponse(res, "Appointment not found", 404);

    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    if (appointment.doctorId !== doctorProfile.id) {
      return errorResponse(
        res,
        "You can only add notes to your own appointments",
        403,
      );
    }

    if (!["CONFIRMED", "COMPLETED"].includes(appointment.status)) {
      return errorResponse(
        res,
        "Can only add notes to confirmed or completed appointments",
        400,
      );
    }

    const updated = await doctorService.addConsultationNotes(req.params.id, {
      consultationNotes,
      prescription,
      diagnosis,
    });

    // ── Socket emit ──
    io.to(`user:${appointment.userId}`).emit("appointment:notes_added", {
      appointmentId: req.params.id,
      consultationNotes: consultationNotes || null,
      prescription: prescription || null,
      diagnosis: diagnosis || null,
    });

    // ── Notification ──
    await createNotification({
      userId: appointment.userId,
      recipientRole: "USER",
      type: "APPOINTMENT_NOTES_ADDED",
      title: "Consultation Notes Added",
      body: `Dr. ${doctorProfile.name} added consultation notes to your appointment on ${appointment.date.toDateString()}`,
      data: {
        appointmentId: req.params.id,
        doctorName: doctorProfile.name,
        date: appointment.date.toDateString(),
        hasPrescription: !!prescription,
        hasDiagnosis: !!diagnosis,
      },
    });

    return successResponse(
      res,
      updated,
      "Consultation notes added successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to add consultation notes",
      500,
      error.message,
    );
  }
};

// ═══ BULK CONFIRM ═══
export const bulkConfirmAppointments = async (req, res) => {
  try {
    const { appointmentIds } = req.body;

    if (!appointmentIds || !Array.isArray(appointmentIds)) {
      return errorResponse(res, "appointmentIds array is required", 400);
    }

    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const appointmentsToConfirm = await Promise.all(
      appointmentIds.map((id) => doctorService.getAppointmentById(id)),
    );

    const result = await doctorService.bulkConfirmAppointments(
      doctorProfile.id,
      appointmentIds,
    );

    // ── Socket emits ──
    io.to("admin").emit("appointment:bulk_confirmed", {
      confirmedCount: result.count,
      appointmentIds,
    });

    appointmentsToConfirm.forEach((apt) => {
      if (!apt) return;
      io.to(`user:${apt.userId}`).emit("appointment:status_updated", {
        appointmentId: apt.id,
        status: "CONFIRMED",
        doctorName: doctorProfile.name,
        date: apt.date.toDateString(),
        timeSlot: apt.timeSlot,
      });
    });

    // ── Notifications ──
    await createNotification({
      recipientRole: "ADMIN",
      type: "APPOINTMENT_CONFIRMED",
      title: "Bulk Appointments Confirmed",
      body: `Dr. ${doctorProfile.name} confirmed ${result.count} appointment${result.count > 1 ? "s" : ""} at once`,
      data: {
        confirmedCount: result.count,
        appointmentIds,
        doctorName: doctorProfile.name,
      },
    });

    await Promise.all(
      appointmentsToConfirm.filter(Boolean).map((apt) =>
        createNotification({
          userId: apt.userId,
          recipientRole: "USER",
          type: "APPOINTMENT_CONFIRMED",
          title: "Appointment Confirmed",
          body: `Dr. ${doctorProfile.name} confirmed your appointment on ${apt.date.toDateString()} at ${apt.timeSlot}`,
          data: {
            appointmentId: apt.id,
            doctorName: doctorProfile.name,
            date: apt.date.toDateString(),
            timeSlot: apt.timeSlot,
          },
        }),
      ),
    );

    return successResponse(
      res,
      { confirmedCount: result.count },
      `${result.count} appointments confirmed successfully`,
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to confirm appointments",
      500,
      error.message,
    );
  }
};

// ═══ DOWNLOAD PATIENT REPORT ═══
export const downloadPatientReport = async (req, res) => {
  try {
    const appointment = await doctorService.getAppointmentById(req.params.id);
    if (!appointment) return errorResponse(res, "Appointment not found", 404);

    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    if (appointment.doctorId !== doctorProfile.id) {
      return errorResponse(
        res,
        "You can only download reports from your own appointments",
        403,
      );
    }

    if (!appointment.reportFile) {
      return errorResponse(res, "No report attached to this appointment", 404);
    }

    const filePath = path.resolve(appointment.reportFile);
    return res.download(filePath);
  } catch (error) {
    return errorResponse(res, "Failed to download report", 500, error.message);
  }
};

// ═══ PATIENT MANAGEMENT ═══
export const getMyPatients = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const patients = await doctorService.getDoctorPatients(doctorProfile.id);
    return successResponse(res, patients, "Patients fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch patients", 500, error.message);
  }
};

export const getPatientById = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const patient = await doctorService.getPatientById(
      doctorProfile.id,
      req.params.userId,
    );

    if (!patient) return notFoundResponse(res, "Patient not found");

    return successResponse(res, patient, "Patient fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch patient", 500, error.message);
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const doctorProfile = await getDoctorProfileOrError(res, req.user.email);
    if (!doctorProfile) return;

    const appointments = await doctorService.getPatientAppointments(
      doctorProfile.id,
      req.params.userId,
    );
    return successResponse(
      res,
      appointments,
      "Patient appointments fetched successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch patient appointments",
      500,
      error.message,
    );
  }
};

export const getPatientPredictions = async (req, res) => {
  try {
    const predictions = await doctorService.getPatientPredictions(
      req.params.userId,
    );
    return successResponse(
      res,
      predictions,
      "Patient predictions fetched successfully",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch patient predictions",
      500,
      error.message,
    );
  }
};
