import * as adminService from "../../services/admin/admin.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";
import path from "path";

// ═══ DASHBOARD ═══
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, stats, "Dashboard stats fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch stats", 500, error.message);
  }
};

// ═══ USER MANAGEMENT ═══
export const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch users", 500, error.message);
  }
};

// ═══ DOCTOR MANAGEMENT ═══
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await adminService.getAllDoctorsAdmin();
    return successResponse(res, doctors, "Doctors fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch doctors", 500, error.message);
  }
};

export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      specialization,
      qualification,
      experience,
      hospital,
      location,
      phone,
      email,
      bio,
      imageUrl,
      availableDays,
      timeSlots,
      consultFee,
    } = req.body;

    if (
      !name ||
      !specialization ||
      !qualification ||
      !experience ||
      !hospital ||
      !location ||
      !phone ||
      !email ||
      !consultFee
    ) {
      return errorResponse(res, "All required fields must be provided", 400);
    }

    // Parse arrays
    const parsedAvailableDays = Array.isArray(availableDays)
      ? availableDays
      : typeof availableDays === "string"
        ? availableDays.split(",").map((d) => d.trim())
        : [];

    const parsedTimeSlots = Array.isArray(timeSlots)
      ? timeSlots
      : typeof timeSlots === "string"
        ? timeSlots.split(",").map((t) => t.trim())
        : [];

    const doctor = await adminService.createDoctor({
      name,
      specialization,
      qualification,
      experience: Number(experience),
      hospital,
      location,
      phone,
      email,
      bio: bio || null,
      imageUrl: imageUrl || null,
      availableDays: parsedAvailableDays,
      timeSlots: parsedTimeSlots,
      consultFee: Number(consultFee),
    });

    return successResponse(res, doctor, "Doctor added successfully", 201);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, "Doctor with this email already exists", 400);
    }
    return errorResponse(res, "Failed to add doctor", 500, error.message);
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await adminService.getDoctorById(req.params.id);
    if (!doctor) return notFoundResponse(res, "Doctor not found");

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

    const updated = await adminService.updateDoctor(req.params.id, updateData);
    return successResponse(res, updated, "Doctor updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update doctor", 500, error.message);
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await adminService.getDoctorById(req.params.id);
    if (!doctor) return notFoundResponse(res, "Doctor not found");

    await adminService.deleteDoctor(req.params.id);
    return successResponse(res, null, "Doctor deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete doctor", 500, error.message);
  }
};

// ═══ CONTENT MANAGEMENT ═══
export const getAllContent = async (req, res) => {
  try {
    const content = await adminService.getAllContentAdmin();
    return successResponse(res, content, "Content fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch content", 500, error.message);
  }
};

export const createContent = async (req, res) => {
  try {
    const { title, content, category, imageUrl, tags } = req.body;

    if (!title || !content || !category) {
      return errorResponse(
        res,
        "Title, content and category are required",
        400,
      );
    }

    const validCategories = [
      "PCOS_BASICS",
      "NUTRITION",
      "EXERCISE",
      "MENTAL_HEALTH",
      "TREATMENT",
      "LIFESTYLE",
    ];

    if (!validCategories.includes(category)) {
      return errorResponse(
        res,
        `Category must be one of: ${validCategories.join(", ")}`,
        400,
      );
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : [];

    const newContent = await adminService.createContent({
      title,
      content,
      category,
      imageUrl: imageUrl || null,
      tags: parsedTags,
    });

    return successResponse(
      res,
      newContent,
      "Content created successfully",
      201,
    );
  } catch (error) {
    return errorResponse(res, "Failed to create content", 500, error.message);
  }
};

export const updateContent = async (req, res) => {
  try {
    const content = await adminService.getContentById(req.params.id);
    if (!content) return notFoundResponse(res, "Content not found");

    const updateData = { ...req.body };

    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags
        : updateData.tags.split(",").map((t) => t.trim());
    }

    const updated = await adminService.updateContent(req.params.id, updateData);
    return successResponse(res, updated, "Content updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update content", 500, error.message);
  }
};

export const deleteContent = async (req, res) => {
  try {
    const content = await adminService.getContentById(req.params.id);
    if (!content) return notFoundResponse(res, "Content not found");

    await adminService.deleteContent(req.params.id);
    return successResponse(res, null, "Content deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete content", 500, error.message);
  }
};

// ═══ APPOINTMENT MONITORING ═══
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await adminService.getAllAppointments();
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

export const downloadReport = async (req, res) => {
  try {
    const appointment = await adminService.getAppointmentById(req.params.id);
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
