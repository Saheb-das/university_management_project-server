// intenral import
import { CustomError } from "../lib/error";
import courseService from "../service/course";

// types import
import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import { courseschema, TCourseClient } from "../zod/course";

async function createCourse(
  req: AuthRequest<TCourseClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const courseInfo = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isValid = courseschema.safeParse(courseInfo);
    if (!isValid.success) {
      throw new CustomError("invalid data", 400);
    }

    const newCourse = await courseService.createCourse(courseInfo);
    if (!newCourse) {
      throw new CustomError("course not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "course created successfully",
      course: newCourse,
    });
  } catch (error) {
    next(error);
  }
}

async function getCourses(
  req: AuthRequest<{ degreeId: string }, {}, { sem: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { sem } = req.query;
  const { degreeId } = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const includeSemester = sem === "true";

    const courses = await courseService.getAllCourses(
      degreeId,
      includeSemester
    );
    if (!courses) {
      throw new CustomError("courses not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "courses fetched successfully",
      courses: courses,
    });
  } catch (error) {
    next(error);
  }
}

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
