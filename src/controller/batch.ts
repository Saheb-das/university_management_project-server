// internal import
import { CustomError } from "../lib/error";
import batchService from "../service/batch";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export interface IBatchClient {
  addmissionYear: string;
  degreeId: string;
  degreeType: string;
  departmentId: string;
  courseName: string;
  courseId: string;
}

async function createBatch(
  req: AuthRequest<IBatchClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const batchInfo = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthenticate user", 401);
    }

    if (!batchInfo) {
      throw new CustomError("batch information required", 400);
    }

    const newBatch = await batchService.createBatch(batchInfo);
    if (!newBatch) {
      throw new CustomError("batch not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "batch create successfully",
      batch: newBatch,
    });
  } catch (error) {
    next(error);
  }
}

interface IOptions {
  department: string;
  course: string;
}

async function getBatchByName(
  req: AuthRequest<{ batchName: string }, {}, IOptions>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchName } = req.body;
  const options = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!batchName) {
      throw new CustomError("batch name required");
    }

    const deprt = options.department === "true";
    const crs = options.course === "true";

    const batch = await batchService.getBatchByName(batchName, {
      department: deprt,
      course: crs,
    });
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "batch fetch successfully",
      batch: batch,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createBatch,
  getBatchByName,
};
