import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse.utils.js";
import prisma from "../config/prismaclient.js";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Unauthorized: No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    // decoded declared outside, verify uncommented
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return errorResponse(res, "Unauthorized: Invalid token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return errorResponse(res, "Unauthorized: User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Unauthorized: Invalid token", 401);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, "Forbidden: Access denied", 403);
    }
    next();
  };
};
