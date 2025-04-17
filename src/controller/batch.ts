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

async function getBatches(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const batches = await batchService.getAllBatches(collageId);
    if (!batches) {
      throw new CustomError("batches not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "batches fetch successfully",
      batches: batches,
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
  req: AuthRequest<{}, { batchName: string }, IOptions>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchName } = req.params;
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

async function getBatchWithSemesters(
  req: AuthRequest<{}, { id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!id) {
      throw new CustomError("batch id required", 400);
    }

    const batchWithSemesters = await batchService.getBatchWithSemesters(id);
    if (!batchWithSemesters) {
      throw new CustomError("batch not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "batch fetch successfully",
      batchSemDetails: batchWithSemesters,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createBatch,
  getBatches,
  getBatchByName,
  getBatchWithSemesters,
};
