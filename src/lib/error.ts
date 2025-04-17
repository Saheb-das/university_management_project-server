// external import
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";

export class CustomError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// global error handler
function globalErrorHandler(
  err: CustomError | Error | unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof CustomError) {
    // Check if it's a CustomError, which contains the ZodError
    if (err.details instanceof ZodError) {
      // If there are Zod errors, format and include them in the response
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: formatZodErrors(err.details),
      });
    } else {
      // Otherwise, handle custom error without Zod errors
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
  } else if (err instanceof Error) {
    res.status(500).json({ success: false, message: err.message });
  } else {
    res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred" });
  }
}

// no match route handler
function noMatchRoute(_req: Request, _res: Response, next: NextFunction) {
  next(new CustomError("Invalid path url", 404));
}

// export
export { globalErrorHandler, noMatchRoute };

function formatZodErrors(
  err: ZodError
): { message: string; path: string; code: string }[] {
  return err.errors.map((error: ZodIssue) => ({
    message: error.message,
    path: error.path.join("."), // Join path segments to make it readable
    code: error.code, // The error code, like 'invalid_type', 'too_small', etc.
  }));
}
