import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse.utils.js";
import prisma from "../config/prismaclient.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authenticate: check if JWT is valid
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, { message: "Unauthorized: No token provided", status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET); 

    // Attach user to request
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return errorResponse(res, { message: "Unauthorized: User not found", status: 401 });
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, { message: "Unauthorized: Invalid token", status: 401 });
  }
};

// Authorize: check if user has required role(s)
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, { message: "Forbidden: Access denied", status: 403 });
    }
    next();
  };
};
