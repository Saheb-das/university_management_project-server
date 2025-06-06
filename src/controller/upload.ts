// external import
import fs from "fs";

// internal import
import uploadService from "../service/upload";
import { CustomError } from "../lib/error";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { getFileName } from "../lib/fileName";
import path from "path";

async function changeAvatar(
  req: AuthRequest<{ oldPath: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { oldPath } = req.body;
  try {
    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const userId = req.authUser.id;
    const collageId = req.authUser.collageId;

    const { path } = req.file;

    const avatarUpdated = await uploadService.changeAvatar(
      userId,
      collageId,
      path,
      oldPath
    );
    if (!avatarUpdated) {
      throw new CustomError("avatar not updated", 500);
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      profile: avatarUpdated,
    });
  } catch (error) {
    next(error);
  }
}

async function changeLogo(
  req: AuthRequest<{ oldPath: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { oldPath } = req.body;
  try {
    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const { path } = req.file;

    const logoUpdated = await uploadService.changeLogo(
      collageId,
      path,
      oldPath
    );
    if (!logoUpdated) {
      throw new CustomError("logo not updated", 500);
    }

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      collageLogo: logoUpdated,
    });
  } catch (error) {
    next(error);
  }
}

interface IDocBody {
  batchName: string;
  semNo: string;
  subName: string;
}
async function uploadNewDoc(
  req: AuthRequest<IDocBody>,
  res: Response,
  next: NextFunction
) {
  const { batchName, semNo, subName } = req.body;
  try {
    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!batchName || !semNo || !subName) {
      throw new CustomError("batch name, sem no and sub name required", 400);
    }

    const newFileName = getFileName(req.file, req.authUser, {
      batch: batchName,
      sem: semNo,
      sub: subName,
    });

    const newPath = path.join("uploads/documents", newFileName);
    fs.renameSync(req.file.path, newPath);

    res.status(200).json({
      success: true,
      message: "document uploaded successfully",
      docPath: newPath,
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

    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
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
  changeAvatar,
  changeLogo,
  uploadNewDoc,
  changeUpload, // it will be deleted
};
