import * as adminService from "../services/admin.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.utils.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, stats, "Dashboard stats fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch stats", 500, error.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch users", 500, error.message);
  }
};
