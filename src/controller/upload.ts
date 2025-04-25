// external import
import fs from "fs";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { CustomError } from "../lib/error";

async function createNewUpload(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    const { filename, path } = req.file;

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      filename,
      path,
    });
  } catch (error) {
    next(error);
  }
}

async function changeUpload(
  req: AuthRequest<{ oldPath: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { oldPath } = req.body;

  try {
    if (!oldPath) {
      throw new CustomError("old uploaded file path required", 400);
    }

    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    const { filename, path } = req.file;

    // delete old uploaded file
    fs.unlinkSync(oldPath);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      filename,
      path,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createNewUpload,
  changeUpload,
};
