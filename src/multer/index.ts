// external import
import multer from "multer";
import fs from "fs";

// internal import
import { CustomError } from "../lib/error";

// types import
import { Request } from "express";
import { AuthRequest } from "../types";
import { getFileName } from "../lib/fileName";

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    let uploadPath;

    if (file.fieldname === "profilePic") {
      uploadPath = "uploads/profile-pictures";
    } else if (file.fieldname === "document") {
      uploadPath = "uploads/documents";
    } else if (file.fieldname === "project") {
      uploadPath = "uploads/project";
    } else if (file.fieldname === "event") {
      uploadPath = "uploads/event";
    } else if (file.fieldname === "logo") {
      uploadPath = "uploads/logos";
    } else {
      uploadPath = "uploads/others";
    }

    // Ensure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req: Request, file, cb) {
    try {
      const authReq = req as AuthRequest;

      if (!authReq.authUser) {
        throw new CustomError("unauthorized user", 401);
      }

      const fileName = getFileName(file, authReq.authUser);

      cb(null, fileName);
    } catch (error) {
      cb(new CustomError("invalid request format"), "");
    }
  },
});

export const upload = multer({ storage: storage });
