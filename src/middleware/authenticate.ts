// internal import
import { CustomError } from "../lib/error";
import { verifyAccessToken } from "../lib/jwtToken";

// types imoprt
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { ExtendedError, Socket } from "socket.io";

// middleware for http connection
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

// middleware for socket (ws) connection - namespace lavel middleware
function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    next(new CustomError("access token required", 400));
  }

  try {
    const isVerifiedUser = verifyAccessToken(token);
    if (!isVerifiedUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const user = {
      id: isVerifiedUser.id,
      role: isVerifiedUser.role,
      email: isVerifiedUser.email,
      collageId: isVerifiedUser.collageId,
    };
    socket.data.authUser = user;
    next();
  } catch (error) {
    next(new CustomError("Invalid token", 401));
  }
}

export { authenticateHTTP, authenticateSocket };
