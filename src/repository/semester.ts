import { Semester } from "@prisma/client";
import prisma from "../lib/prisma";

interface ISemeter {
  semesterNo: number;
  courseId: string;
}

async function create(semesterInfo: ISemeter): Promise<Semester | null> {
  const newSemester = await prisma.semester.create({
    data: {
      semNo: semesterInfo.semesterNo,
      courseId: semesterInfo.courseId,
    },
  });

  return newSemester;
}

// export
export default {
  create,
};
