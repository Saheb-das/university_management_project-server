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
      console.log(isValid.error);
      throw new CustomError("invalid data", 400, isValid.error);
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
  req: AuthRequest<{}, {}, { degreeId: string; sem: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { degreeId, sem } = req.query;
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

async function getSubjectsByCourseId(
  req: AuthRequest<{}, {}, { courseId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { courseId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!courseId) {
      throw new CustomError("course id required", 400);
    }

    const subjects = await courseService.getAllSubjectsByCourseId(courseId);
    if (!subjects) {
      throw new CustomError("subjects not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "course subjects fetched successfully",
      courseSubjects: subjects,
    });
  } catch (error) {
    next(error);
  }
}

async function getCourse(
  req: AuthRequest<{}, { id: string }>,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!id) {
      throw new CustomError("course id required", 400);
    }

    const course = await courseService.getCourseById(id);
    if (!course) {
      throw new CustomError("course not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "course fetched successfully",
      course: course,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCourse() {}
async function deleteCourse() {}

// export
export default {
  createCourse,
  getCourses,
  getCourse,
  getSubjectsByCourseId,
  updateCourse,
  deleteCourse,
};
