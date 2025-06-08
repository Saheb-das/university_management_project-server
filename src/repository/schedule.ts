// internal import
import prisma from "../lib/prisma";

// types import
import { Day, Prisma } from "@prisma/client";

export type TScheduleWithLecture = Prisma.ScheduleGetPayload<{
  include: {
    lectures: {
      include: {
        subject: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;
async function findByRoutineIdAndDayIncLectures(
  routineId: string,
  day: string
): Promise<TScheduleWithLecture | null> {
  const scheduleWithLectures = await prisma.schedule.findFirst({
    where: {
      routineId: routineId,
      day: day as Day,
    },
    include: {
      lectures: {
        include: {
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return scheduleWithLectures;
}

export default {
  findByRoutineIdAndDayIncLectures,
};
