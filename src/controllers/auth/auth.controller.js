import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "../../utils/apiResponse.utils.js";
import * as authService from "../../services/auth/auth.service.js";
import { sendVerificationEmail } from "../../utils/otpEmail.utils.js";
export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    console.log("Register result:", result); // ← ADD
    await sendVerificationEmail(result.email, result.otp);
    console.log("Email sent successfully"); // ← ADD
    return successResponse(
      res,
      { email: result.email },
      "Registration successful. Check your email for OTP.",
      201,
    );
  } catch (error) {
    console.error("Register error:", error); // ← ADD
    return errorResponse(res, error.message, 400);
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp); // ← get result
    return successResponse(res, result, "Email verified successfully"); 
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
//Login existing user
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

//Get current user profile
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

// Register doctor
export const registerDoctor = async (req, res) => {
  try {
    const result = await authService.registerDoctor(req.body);
    return successResponse(res, result, "Doctor registered successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
