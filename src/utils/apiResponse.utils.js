// src/utils/apiResponse.js

/**
 * Standard API response helper
 */

export const successResponse = (
  res,
  data = {},
  message = "Success",
  status = 200
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Something went wrong",
  status = 500,
  errors = null
) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};

export const notFoundResponse = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message,
  });
};

export const unauthorizedResponse = (res, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message,
  });
};
