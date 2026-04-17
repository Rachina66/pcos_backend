import * as cycleService from "../../services/cycle/cycle.service.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse.utils.js";

export const upsertDailyLog = async (req, res) => {
  try {
    const log = await cycleService.upsertDailyLog(req.user.id, req.body);
    return successResponse(res, log, "Daily log saved", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getDailyLog = async (req, res) => {
  try {
    const log = await cycleService.getDailyLog(req.user.id, req.params.date);
    return successResponse(res, log, "Daily log fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch log", 500, error.message);
  }
};

export const getDailyLogsInRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    const logs = await cycleService.getDailyLogsInRange(req.user.id, from, to);
    return successResponse(res, logs, "Logs fetched");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

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

export const predictNextPeriod = async (req, res) => {
  try {
    const prediction = await cycleService.predictNextPeriod(req.user.id);
    return successResponse(res, prediction, "Prediction fetched");
  } catch (error) {
    return errorResponse(res, "Failed to get prediction", 500, error.message);
  }
};

export const getInsights = async (req, res) => {
  try {
    const insights = await cycleService.getInsights(req.user.id);
    return successResponse(res, insights, "Insights fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch insights", 500, error.message);
  }
};
