// internal import
import prisma from "../lib/prisma";

// types import
import { Day, Prisma } from "@prisma/client";

export type TLecWithSub = Prisma.LectureGetPayload<{
  include: {
    subject: {
      select: {
        name: true;
      };
    };
  };
}>;
async function findAllByTeacherIdAndDay(
  teacherId: string,
  day: string
): Promise<TLecWithSub[] | []> {
  const lectures = await prisma.lecture.findMany({
    where: {
      asignTeacher: {
        teacherId: teacherId,
      },
      schedule: {
        day: day as Day,
      },
    },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
    },
  });

  return lectures;
}

// export
export default {
  findAllByTeacherIdAndDay,
};
