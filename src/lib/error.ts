// external import
import { Request, Response, NextFunction } from "express";

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;

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
    res.status(err.statusCode).json({ success: false, message: err.message });
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
