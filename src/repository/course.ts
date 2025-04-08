// external import
import prisma from "../lib/prisma";

// internal import
import { Course } from "@prisma/client";
import { ICourse } from "../service/course";

async function create(courseInfo: ICourse): Promise<Course | null> {
  const newCourse = await prisma.course.create({
    data: {
      name: courseInfo.name,
      duration: courseInfo.duration,
      courseFees: courseInfo.courseFees,
      numberOfSem: courseInfo.numberOfSem,
      degreeId: courseInfo.degreeId,
    },
  });

  return newCourse;
}

async function findAll(
  degreeId: string,
  includeSemester: boolean
): Promise<Course[] | null> {
  const courses = await prisma.course.findMany({
    where: {
      degreeId: degreeId,
    },
    include: {
      semesters: includeSemester,
    },
  });
  return courses;
}

async function findByIdWithFilter(
  courseId: string,
  field?: keyof Course,
  value?: string
): Promise<Course | null> {
  const whereClause: any = {
    id: courseId,
  };

  if (field && value !== undefined) {
    whereClause[field] = value;
  }

  const course = await prisma.course.findFirst({
    where: whereClause,
  });

  return course;
}

// export
export default {
  create,
  findAll,
  findByIdWithFilter,
};
