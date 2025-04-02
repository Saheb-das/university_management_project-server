// external import
import prisma from "../lib/prisma";

// internal import
import { Course } from "@prisma/client";
import { ICourseInfo } from "../service/collage";

async function create(
  degId: string,
  courseInfo: ICourseInfo
): Promise<Course | null> {
  const newCourse = await prisma.course.create({
    data: {
      name: courseInfo.name,
      duration: courseInfo.duration,
      courseFees: courseInfo.courseFees,
      numberOfSem: courseInfo.numberOfSem,
      degreeId: degId,
    },
  });

  return newCourse;
}

// export
export default {
  create,
};
