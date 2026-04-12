import * as cycleService from "../../services/cycle/cycle.service.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse.utils.js";

//LOG PERIOD
export const logPeriod = async (req, res) => {
  try {
    const cycle = await cycleService.logPeriod(req.user.id, req.body);
    return successResponse(res, cycle, "Period logged successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

//GET HISTORY
export const getCycleHistory = async (req, res) => {
  try {
    const cycles = await cycleService.getCycleHistory(req.user.id);
    return successResponse(res, cycles, "Cycle history fetched");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch cycle history",
      500,
      error.message,
    );
  }
};

// ═══ GET LATEST CYCLE ═══
export const getLatestCycle = async (req, res) => {
  try {
    const cycle = await cycleService.getLatestCycle(req.user.id);
    return successResponse(res, cycle, "Latest cycle fetched");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch latest cycle",
      500,
      error.message,
    );
  }
};

// ═══ UPDATE CYCLE ═══
export const updateCycleLog = async (req, res) => {
  try {
    const updated = await cycleService.updateCycleLog(
      req.params.id,
      req.user.id,
      req.body,
    );
    return successResponse(res, updated, "Cycle updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ═══ DELETE CYCLE ═══
export const deleteCycleLog = async (req, res) => {
  try {
    await cycleService.deleteCycleLog(req.params.id, req.user.id);
    return successResponse(res, null, "Cycle log deleted");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ═══ PREDICT NEXT PERIOD ═══
export const predictNextPeriod = async (req, res) => {
  try {
    const prediction = await cycleService.predictNextPeriod(req.user.id);
    return successResponse(res, prediction, "Prediction fetched");
  } catch (error) {
    return errorResponse(res, "Failed to get prediction", 500, error.message);
  }
};

// ═══ LOG SYMPTOMS ═══
export const logSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms)) {
      return errorResponse(res, "Symptoms array is required", 400);
    }
    const log = await cycleService.logSymptoms(req.user.id, symptoms);
    return successResponse(res, log, "Symptoms saved successfully");
  } catch (error) {
    return errorResponse(res, "Failed to save symptoms", 500, error.message);
  }
};

// ═══ GET TODAY'S SYMPTOMS ═══
export const getTodaySymptoms = async (req, res) => {
  try {
    const log = await cycleService.getTodaySymptoms(req.user.id);
    return successResponse(res, log, "Today's symptoms fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch symptoms", 500, error.message);
  }
};

// ═══ SYMPTOM INSIGHTS ═══
export const getSymptomInsights = async (req, res) => {
  try {
    const insights = await cycleService.getSymptomInsights(req.user.id);
    return successResponse(res, insights, "Symptom insights fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch insights", 500, error.message);
  }
};
