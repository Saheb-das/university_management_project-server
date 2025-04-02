// internal import
import collageService, { IDeprtInfo } from "../service/collage";

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
  req: AuthRequest<IDeprtInfo>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const departmentInfo = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!departmentInfo) {
      throw new CustomError("department info required", 400);
    }

    const collageId = req.authUser.collageId;

    const newDepartment = await collageService.createDepartment(
      collageId,
      departmentInfo
    );
    if (!updateCollage) {
      throw new CustomError("department not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "departtment created successfully",
      department: newDepartment,
    });
  } catch (error) {
    next(error);
  }
}

async function getDepartments(
  req: AuthRequest<{}, { id: string }, { degree: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { degree } = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!id) {
      throw new CustomError("collage id require in params", 400);
    }

    const includeDegree = degree === "true";

    const departments = await collageService.getAllDepartments(
      id,
      includeDegree
    );
    if (!departments) {
      throw new CustomError("departments not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "departtments found",
      departments: departments,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  updateCollage,
  createCollageDepartment,
  getDepartments,
};
