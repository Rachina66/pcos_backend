import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Update name
export const updateNameSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters"),
});

// Change password (logged-in user)
export const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty("Current password is required"),
  newPassword: z
    .string()
    .nonempty("New password is required")
    .regex(
      passwordRegex,
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
    ),
});

// Change email
export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .nonempty("New email is required")
    .email("Invalid email address"),
  password: z.string().nonempty("Password is required for verification"),
});

// Forgot password – request OTP
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
});

// Verify OTP
export const verifyOtpSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  otp: z
    .string()
    .nonempty("OTP is required")
    .length(6, "OTP must be 6 digits"),
});

// Reset password (after OTP verified)
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  newPassword: z
    .string()
    .nonempty("New password is required")
    .regex(
      passwordRegex,
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
    ),
});
