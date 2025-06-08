// internal import
import prisma from "../lib/prisma";

// types import
import { Day, Prisma, Routine } from "@prisma/client";
import { IRoutineClient } from "../controller/routine";

// update version
async function create(payload: IRoutineClient): Promise<Routine | null> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Check if routine exists for given semesterId and batchId
    let routine = await tx.routine.findFirst({
      where: {
        semesterId: payload.semesterId,
        batchId: payload.batchId,
      },
    });

    // 2. If not exists, create it
    if (!routine) {
      routine = await tx.routine.create({
        data: {
          semesterId: payload.semesterId,
          batchId: payload.batchId,
        },
      });
    }

    // 3. Loop through each schedule/day
    for (const schedule of payload.schedules) {
      const existingSchedule = await tx.schedule.findFirst({
        where: {
          routineId: routine.id,
          day: schedule.day as Day,
        },
      });

      let currentSchedule;

      if (existingSchedule) {
        // Delete old lectures for this schedule
        await tx.lecture.deleteMany({
          where: {
            scheduleId: existingSchedule.id,
          },
        });

        // Update schedule (e.g., break time)
        currentSchedule = await tx.schedule.update({
          where: {
            id: existingSchedule.id,
          },
          data: {
            break: schedule.break,
          },
        });
      } else {
        // Create new schedule
        currentSchedule = await tx.schedule.create({
          data: {
            day: schedule.day as Day,
            break: schedule.break,
            routineId: routine.id,
          },
        });
      }

      // 4. Add lectures
      for (const lecture of schedule.lectures) {
        await tx.lecture.create({
          data: {
            subjectId: lecture.subject,
            room: lecture.room,
            startTime: lecture.startTime,
            endTime: lecture.endTime,
            scheduleId: currentSchedule.id,
          },
        });
      }
    }

    return routine;
  });

  return result;
}

export type RoutineWithDetails = Prisma.RoutineGetPayload<{
  include: {
    schedules: {
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
    };
  };
}>;

async function findByProps(
  conditions: { field: keyof Routine; value: string }[]
): Promise<RoutineWithDetails | null> {
  const whereClause = Object.fromEntries(
    conditions.map(({ field, value }) => [field, value])
  );

  const routine = await prisma.routine.findFirst({
    where: whereClause,
    include: {
      schedules: {
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
      },
    },
  });

  return routine;
}

async function findByBatchIdAndSemId(
  batchId: string,
  semId: string
): Promise<Routine | null> {
  const routine = await prisma.routine.findFirst({
    where: {
      batchId: batchId,
      semesterId: semId,
    },
  });

  return routine;
}

// export
export default {
  create,
  findByProps,
  findByBatchIdAndSemId,
};
