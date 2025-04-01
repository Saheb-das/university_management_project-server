// internal import
import collageService from "../service/collage";

// types imoprt
import { Response, NextFunction } from "express";
import { AuthRequest, ICollageUpdate } from "../types";
import { CustomError } from "../lib/error";

async function updateCollage(
  req: AuthRequest<ICollageUpdate>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const updatedCollage = await collageService.updateCollage(
      req.body,
      collageId
    );
    if (!updateCollage) {
      throw new CustomError("collage updated failed", 500);
    }

    res.status(200).json({
      success: true,
      message: "collage update successfully",
      colage: updatedCollage,
    });
  } catch (error) {
    next(error);
  }
}

async function createCollageDepartment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {}

// export
export default {
  updateCollage,
  createCollageDepartment,
};
