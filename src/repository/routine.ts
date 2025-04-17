// internal import
import prisma from "../lib/prisma";

// types import
import { Day, Prisma, Routine } from "@prisma/client";
import { IRoutineClient } from "../controller/routine";

async function create(payload: IRoutineClient): Promise<Routine | null> {
  const result = await prisma.$transaction(async (tx) => {
    // routine
    const newRoutine = await tx.routine.create({
      data: {
        semesterId: payload.semesterId,
        batchId: payload.batchId,
      },
    });

    for (const schedule of payload.schedules) {
      // schedule
      const newSchedule = await tx.schedule.create({
        data: {
          day: schedule.day as Day,
          break: schedule.break,
          routineId: newRoutine.id,
        },
      });

      for (const lecture of schedule.lectures) {
        // lecture
        const newLecture = await tx.lecture.create({
          data: {
            subjectId: lecture.subject,
            room: lecture.room,
            startTime: lecture.startTime,
            endTime: lecture.endTime,
            scheduleId: newSchedule.id,
          },
        });
      }
    }

    return newRoutine;
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
  field: keyof Routine,
  value: string
): Promise<RoutineWithDetails | null> {
  const routine = await prisma.routine.findFirst({
    where: {
      [field]: value,
    },
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

// export
export default {
  create,
  findByProps,
};
