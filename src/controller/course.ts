import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

async function createCourse(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {}

async function getCourses() {}
async function getCourse() {}
async function updateCourse() {}
async function deleteCourse() {}

// export
export default {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};
