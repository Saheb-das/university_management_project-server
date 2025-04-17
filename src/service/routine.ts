// internal import
import routineRepository, { RoutineWithDetails } from "../repository/routine";
import batchRepository from "../repository/batch";

// types import
import { Day, Routine } from "@prisma/client";
import { IRoutineClient } from "../controller/routine";
import { CustomError } from "../lib/error";

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
  batchName: string
): Promise<RoutineWithDetails | null> {
  try {
    const isExist = await batchRepository.findByName(batchName);
    if (!isExist) {
      throw new CustomError("batch not found", 404);
    }

    const routine = await routineRepository.findByProps("batchId", isExist.id);
    if (!routine) {
      throw new CustomError("routine not found", 404);
    }

    return routine;
  } catch (error) {
    console.log("Error fetched routine", error);
    return null;
  }
}

// export
export default {
  createRoutine,
  getRoutineByBatchName,
};
