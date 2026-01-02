import { z } from "zod";

// Strong password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .nonempty("Password is required")
    .regex(
      passwordRegex,
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
    ),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .nonempty("Password is required")
    .regex(
      passwordRegex,
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
    ),
});
