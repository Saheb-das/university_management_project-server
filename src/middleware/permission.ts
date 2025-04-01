// internal import
import { Permissions } from "../model/permission";

// types import
import { NextFunction, Response, RequestHandler } from "express";
import { AuthRequest, TRole } from "../types/auth";
import { CustomError } from "../lib/error";

// check permission by roles
export function checkPermission(requiredPermission: string): RequestHandler {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const userRole: TRole | undefined = req.authUser?.role;
      if (!userRole) {
        throw new CustomError("unauthenticate user", 401);
      }

      const permissions = new Permissions().getPermissionsByRoleName(userRole);

      if (!permissions.includes(requiredPermission)) {
        throw new CustomError("Forbidden: Access denied", 403);
      }

      next(); // Permission granted
    } catch (error) {
      next(error);
    }
  };
}
