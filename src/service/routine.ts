// internal import
import routineRepository, { RoutineWithDetails } from "../repository/routine";
import batchRepository from "../repository/batch";
import semesterRepository from "../repository/semester";
import scheduleRepository, {
  TScheduleWithLecture,
} from "../repository/schedule";
import { CustomError } from "../lib/error";

// types import
import { Day, Routine } from "@prisma/client";
import { IRoutineClient } from "../controller/routine";

export interface IRoutine {
  semesterId: string;
  batchId: string;
}

export interface ISchedule {
  day: Day;
  break: string;
}

export interface ILecture {
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
}

async function createRoutine(
  routineInfo: IRoutineClient
): Promise<Routine | null> {
  try {
    const isExistBatch = await batchRepository.findByIdAndSemId(
      routineInfo.batchId,
      routineInfo.semesterId
    );
    if (!isExistBatch) {
      throw new CustomError("batch not found", 404);
    }

    const newRoutine = await routineRepository.create(routineInfo);
    if (!newRoutine) {
      throw new CustomError("routine not created", 500);
    }

    return newRoutine;
  } catch (error) {
    console.log("Error create routine", error);
    return null;
  }
}

async function getRoutineByBatchName(
  batchName: string,
  semId: string
): Promise<RoutineWithDetails | null> {
  try {
    const isExist = await batchRepository.findByName(batchName);
    if (!isExist) {
      throw new CustomError("batch not found", 404);
    }

    const sem = await semesterRepository.findById(semId);
    if (!sem) {
      throw new CustomError("semester not found", 404);
    }

    const routine = await routineRepository.findByProps([
      { field: "batchId", value: isExist.id },
      { field: "semesterId", value: semId },
    ]);
    if (!routine) {
      throw new CustomError("routine not found", 404);
    }

    return routine;
  } catch (error) {
    console.log("Error fetched routine", error);
    return null;
  }
}

async function getScheduleByBatchId(
  batchId: string,
  day: string,
  semId: string
): Promise<TScheduleWithLecture | null> {
  try {
    const batch = await batchRepository.findById(batchId);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const sem = await semesterRepository.findById(semId);
    if (!sem) {
      throw new CustomError("semester not found", 404);
    }

    const routine = await routineRepository.findByBatchIdAndSemId(
      batch.id,
      sem.id
    );
    if (!routine) {
      throw new CustomError("routine not found", 404);
    }

    const schedule = await scheduleRepository.findByRoutineIdAndDayIncLectures(
      routine.id,
      day
    );
    if (!schedule) {
      throw new CustomError("schedule not found", 404);
    }

    return schedule;
  } catch (error) {
    console.log("Error fetched routine", error);
    return null;
  }
}

// export
export default {
  createRoutine,
  getRoutineByBatchName,
  getScheduleByBatchId,
};
