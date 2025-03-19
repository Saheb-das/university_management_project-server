// types import
import { Request, Response, NextFunction } from "express";

async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {}

async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {}

// export
export default {
  register,
  login,
};
