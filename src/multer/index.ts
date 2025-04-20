// external import
import multer from "multer";
import fs from "fs";
import path from "path";

// internal import
import { CustomError } from "../lib/error";

// types import
import { Request } from "express";
import { AuthRequest } from "../types";
import { IMaterialQuery } from "../controller/studyroom";

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    let uploadPath;

    if (file.fieldname === "profilePic") {
      uploadPath = "uploads/profile-pictures";
    } else if (file.fieldname === "document") {
      uploadPath = "uploads/documents";
    } else {
      uploadPath = "uploads/others";
    }

    // Ensure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req: Request, file, cb) {
    try {
      const ext = path.extname(file.originalname);
      const authReq = req as unknown as AuthRequest<
        { title: string },
        {},
        IMaterialQuery
      >;
      const { batch, sub, sem } = req.query;
      let fileName = "";

      if (!authReq.authUser) {
        throw new CustomError("unauthorized user", 401);
      }

      if (file.fieldname === "profilePic") {
        fileName = `${authReq.authUser.role}_${authReq.authUser.id}${ext}`;
      } else if (file.fieldname === "document") {
        fileName = `${batch}_${sem}_${sub}`;
      } else {
        fileName = `${new Date()}`;
      }

      cb(null, fileName);
    } catch (error) {
      cb(new CustomError("invalid request format"), "");
    }
  },
});

export const upload = multer({ storage: storage });
