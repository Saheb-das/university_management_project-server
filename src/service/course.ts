// internal import
import courseRepository from "../repository/course";
import semesterRepository from "../repository/semester";
import degreeRepository from "../repository/degree";
import { CustomError } from "../lib/error";

// types import
import { Course } from "@prisma/client";
import { TCourseClient } from "../zod/course";

export interface ICourse {
  name: string;
  duration: number;
  courseFees: string;
  numberOfSem: number;
  degreeId: string;
}

async function createCourse(courseInfo: TCourseClient): Promise<Course | null> {
  try {
    const isExistDegree = await degreeRepository.findById(courseInfo.degree);
    if (!isExistDegree) {
      throw new CustomError("degree not found", 404);
    }

    const coursePayload: ICourse = {
      name: courseInfo.name,
      courseFees: courseInfo.totalFees,
      duration: Number(courseInfo.duration),
      numberOfSem: Number(courseInfo.semesters),
      degreeId: courseInfo.degree,
    };

    const newCourse = await courseRepository.create(coursePayload);
    if (!newCourse) {
      throw new CustomError("course not created", 500);
    }

    // create semester according to course semeter number
    for (let i = 1; i <= newCourse.numberOfSem; i++) {
      let newSemester = await semesterRepository.create({
        semesterNo: i,
        courseId: newCourse.id,
      });
      if (!newSemester) {
        throw new CustomError("semester not created", 500);
      }
    }

    return newCourse;
  } catch (error) {
    console.log("Error create course", error);
    return null;
  }
}

async function getAllCourses(
  degreeId: string,
  includeSemester: boolean
): Promise<Course[] | null> {
  try {
    const courses = await courseRepository.findAll(degreeId, includeSemester);
    return courses;
  } catch (error) {
    console.log("Error find courses", error);
    return null;
  }
}

async function getAllSubjectsByCourseId(courseId: string) {
  try {
    const course = await courseRepository.findByIdWithFilter(courseId);
    if (!course) {
      throw new CustomError("course not found", 404);
    }

    const courseSubjects = courseRepository.findAllSubjectsIncludeSemester(
      course.id
    );
    if (!courseSubjects) {
      throw new CustomError("course subjects not found", 404);
    }

    return courseSubjects;
  } catch (error) {
    console.log("Error finding course subjects", error);
    return null;
  }
}

// export
export default {
  createCourse,
  getAllCourses,
  getAllSubjectsByCourseId,
};
