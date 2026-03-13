import * as publicService from "../../services/public/public.service.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/apiResponse.utils.js";

// ═══ DOCTORS ═══
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await publicService.getAllDoctors();
    return successResponse(res, doctors, "Doctors fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch doctors", 500, error.message);
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await publicService.getDoctorById(req.params.id);
    if (!doctor) return notFoundResponse(res, "Doctor not found");
    return successResponse(res, doctor, "Doctor fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch doctor", 500, error.message);
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return errorResponse(res, "Date parameter is required", 400);
    }

    const result = await publicService.getAvailableSlots(id, date);

    if (!result) {
      return notFoundResponse(res, "Doctor not found");
    }

    return successResponse(res, result, "Available slots fetched successfully");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch available slots",
      500,
      error.message,
    );
  }
};

// ═══ EDUCATIONAL CONTENT ═══
export const getAllContent = async (req, res) => {
  try {
    const { category } = req.query;

    const content = category
      ? await publicService.getContentByCategory(category)
      : await publicService.getAllContent();

    return successResponse(res, content, "Content fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch content", 500, error.message);
  }
};

export const getContentById = async (req, res) => {
  try {
    const content = await publicService.getContentById(req.params.id);
    if (!content) return notFoundResponse(res, "Content not found");
    return successResponse(res, content, "Content fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch content", 500, error.message);
  }
};
