import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "../../utils/apiResponse.utils.js";
import * as authService from "../../services/auth/auth.service.js";

// Register new user
export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, "Registration successful", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    if (!result) {
      return unauthorizedResponse(res, "Invalid email or password");
    }

    return successResponse(res, result, "Login successful");
  } catch (error) {
    return errorResponse(res, "Login failed", 500, error.message);
  }
};

// Get current user profile
export const profile = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch profile", 500, error.message);
  }
};
