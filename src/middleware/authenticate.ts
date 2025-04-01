// internal import
import { CustomError } from "../lib/error";
import { verifyAccessToken } from "../lib/jwtToken";

// types imoprt
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

async function authenticateHTTP(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      throw new CustomError("unauthorized user", 401);
    }

    const isVerifiedUser = verifyAccessToken(token);
    if (!isVerifiedUser) {
      throw new CustomError("unauthorized user", 401);
    }

    req.authUser = {
      id: isVerifiedUser.id,
      role: isVerifiedUser.role,
      email: isVerifiedUser.email,
      collageId: isVerifiedUser.collageId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export { authenticateHTTP };
