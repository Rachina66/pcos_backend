import * as doctorService from "../services/doctor.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../utils/apiResponse.utils.js";

// GET /api/doctors - Public (users can see)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    return successResponse(res, doctors, "Doctors fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch doctors", 500, error.message);
  }
};

// GET /api/doctors/:id - Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return notFoundResponse(res, "Doctor not found");
    return successResponse(res, doctor, "Doctor fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch doctor", 500, error.message);
  }
};

//Array parsing for availableDays and timeSlots
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

    //Safely parse arrays
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

    const doctor = await doctorService.createDoctor({
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

//Array and number parsing in update
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return notFoundResponse(res, "Doctor not found");

    const updateData = { ...req.body };

    //Parse arrays if provided
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

    //Parse numbers if provided
    if (updateData.experience)
      updateData.experience = Number(updateData.experience);
    if (updateData.consultFee)
      updateData.consultFee = Number(updateData.consultFee);

    const updated = await doctorService.updateDoctor(req.params.id, updateData);
    return successResponse(res, updated, "Doctor updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update doctor", 500, error.message);
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return notFoundResponse(res, "Doctor not found");

    await doctorService.deleteDoctor(req.params.id);
    return successResponse(res, null, "Doctor deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete doctor", 500, error.message);
  }
};
