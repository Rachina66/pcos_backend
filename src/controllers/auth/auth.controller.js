import { successResponse, errorResponse, unauthorizedResponse } from "../../utils/apiResponse.js";
import authService from "../../services/auth/auth.service.js";

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, "Registration successful", 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Login existing user
  async login(req, res) {
    try {
      const result = await authService.login(req.body);

      if (!result) {
        return unauthorizedResponse(res, "Invalid email or password");
      }

      return successResponse(res, result, "Login successful");
    } catch (error) {
      return errorResponse(res, "Login failed", 500, error.message);
    }
  }

  // Optional: get current user profile
  async profile(req, res) {
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
  }
}

export default new AuthController();
