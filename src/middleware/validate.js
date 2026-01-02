import { errorResponse } from "../utils/apiResponse.utils.js";
export const validate = (schemas) => (req, res, next) => {
  if (schemas.body) {
    const result = schemas.body.safeParse(req.body);
    if (!result.success) {
      return errorResponse(res, {
        message: "Validation error",
        status: 400,
        errors: result.error.errors,
      });
    }
  }

  if (schemas.params) {
    const result = schemas.params.safeParse(req.params);
    if (!result.success) {
      return errorResponse(res, {
        message: "Validation error",
        status: 400,
        errors: result.error.errors,
      });
    }
  }

  if (schemas.query) {
    const result = schemas.query.safeParse(req.query);
    if (!result.success) {
      return errorResponse(res, {
        message: "Validation error",
        status: 400,
        errors: result.error.errors,
      });
    }
  }

  next();
};


