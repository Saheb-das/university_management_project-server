// internal import
import { CustomError } from "../lib/error";
import { routineSchema } from "../zod/routine";
import routineService from "../service/routine";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

interface ILectureClient {
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface IScheduleClient {
  break: string;
  day: string;
  lectures: ILectureClient[];
}

export interface IRoutineClient {
  batchId: string;
  semesterId: string;
  schedules: IScheduleClient[];
}

// this is dummy routine data
const dummyRoutine: IRoutineClient = {
  batchId: "batch-2025",
  semesterId: "sem-4",
  schedules: [
    {
      day: "Monday",
      break: "12:00 PM - 12:30 PM",
      lectures: [
        {
          subject: "Mathematics",
          startTime: "09:00 AM",
          endTime: "10:00 AM",
          room: "Room 101",
        },
        {
          subject: "Physics",
          startTime: "10:15 AM",
          endTime: "11:15 AM",
          room: "Room 102",
        },
        {
          subject: "Chemistry",
          startTime: "11:30 AM",
          endTime: "12:30 PM",
          room: "Lab 1",
        },
        {
          subject: "Computer Science",
          startTime: "12:45 PM",
          endTime: "01:45 PM",
          room: "Lab 2",
        },
      ],
    },
    {
      day: "Tuesday",
      break: "11:00 AM - 11:30 AM",
      lectures: [
        {
          subject: "English",
          startTime: "09:00 AM",
          endTime: "10:00 AM",
          room: "Room 103",
        },
        {
          subject: "Mathematics",
          startTime: "10:15 AM",
          endTime: "11:00 AM",
          room: "Room 101",
        },
        {
          subject: "Physics Lab",
          startTime: "11:30 AM",
          endTime: "01:00 PM",
          room: "Lab 3",
        },
      ],
    },
    {
      day: "Wednesday",
      break: "01:00 PM - 01:30 PM",
      lectures: [
        {
          subject: "Chemistry",
          startTime: "09:00 AM",
          endTime: "10:00 AM",
          room: "Room 104",
        },
        {
          subject: "Computer Science",
          startTime: "10:15 AM",
          endTime: "11:15 AM",
          room: "Lab 2",
        },
        {
          subject: "English",
          startTime: "11:30 AM",
          endTime: "12:30 PM",
          room: "Room 103",
        },
        {
          subject: "Maths Tutorial",
          startTime: "01:30 PM",
          endTime: "02:30 PM",
          room: "Room 101",
        },
      ],
    },
    {
      day: "Thursday",
      break: "11:15 AM - 11:45 AM",
      lectures: [
        {
          subject: "Mathematics",
          startTime: "09:00 AM",
          endTime: "10:00 AM",
          room: "Room 101",
        },
        {
          subject: "Physics",
          startTime: "10:00 AM",
          endTime: "11:15 AM",
          room: "Room 102",
        },
        {
          subject: "Computer Science Lab",
          startTime: "11:45 AM",
          endTime: "01:15 PM",
          room: "Lab 2",
        },
      ],
    },
    {
      day: "Friday",
      break: "12:30 PM - 01:00 PM",
      lectures: [
        {
          subject: "Chemistry",
          startTime: "09:00 AM",
          endTime: "10:00 AM",
          room: "Lab 1",
        },
        {
          subject: "English",
          startTime: "10:15 AM",
          endTime: "11:15 AM",
          room: "Room 103",
        },
        {
          subject: "Maths Quiz",
          startTime: "11:30 AM",
          endTime: "12:30 PM",
          room: "Room 101",
        },
        {
          subject: "Seminar",
          startTime: "01:00 PM",
          endTime: "02:00 PM",
          room: "Seminar Hall",
        },
      ],
    },
    {
      day: "Saturday",
      break: "10:30 AM - 11:00 AM",
      lectures: [
        {
          subject: "Soft Skills",
          startTime: "09:00 AM",
          endTime: "10:30 AM",
          room: "Room 105",
        },
        {
          subject: "Workshop",
          startTime: "11:00 AM",
          endTime: "01:00 PM",
          room: "Lab 4",
        },
      ],
    },
  ],
};

async function createRoutine(
  req: AuthRequest<IRoutineClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const routineInfo = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isValid = routineSchema.safeParse(routineInfo);
    if (!isValid.success) {
      throw new CustomError("invalid input", 400, isValid.error);
    }

    const newRoutine = await routineService.createRoutine(isValid.data);
    if (!newRoutine) {
      throw new CustomError("routine not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "routine created successfully",
      routine: newRoutine,
    });
  } catch (error) {
    next(error);
  }
}

async function getScheduleByBatchId(
  req: AuthRequest<{}, { batchId: string }, { day: string; semId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchId } = req.params;
  const { day, semId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (day.toLowerCase() === "sunday") {
      res.status(200).json({
        success: true,
        message: "schedule fetched successfully",
        schedule: undefined,
      });
    }

    if (!batchId) {
      throw new CustomError("batch name required", 400);
    }

    if (!day || !semId) {
      throw new CustomError("day and sem id required", 404);
    }

    const schedule = await routineService.getScheduleByBatchId(
      batchId,
      day,
      semId
    );
    if (!schedule) {
      throw new CustomError("schedule not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "schedule fetched successfully",
      schedule: schedule,
    });
  } catch (error) {
    next(error);
  }
}

async function getRoutineByBatchName(
  req: AuthRequest<{}, { batch: string }, { sem: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batch } = req.params;
  const { sem } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!batch) {
      throw new CustomError("batch name required", 400);
    }

    if (!sem) {
      throw new CustomError("semester id required", 404);
    }

    const routine = await routineService.getRoutineByBatchName(batch, sem);
    if (!routine) {
      throw new CustomError("routine not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "routine fetched successfully",
      routine: routine,
    });
  } catch (error) {
    next(error);
  }
}

async function getLecturesByTeacherUserIdAndDay(
  req: AuthRequest<{}, {}, { userId: string; day: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId, day } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!userId) {
      throw new CustomError("teacher user id required", 400);
    }

    if (!day) {
      throw new CustomError("day required", 404);
    }

    const lectures = await routineService.getAllLecturesByTeacherUserIdAndDay(
      userId,
      day
    );
    if (!lectures) {
      throw new CustomError("lectures not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "lectures fetched successfully",
      lectures: lectures,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createRoutine,
  getRoutineByBatchName,
  getScheduleByBatchId,
  getLecturesByTeacherUserIdAndDay,
};
