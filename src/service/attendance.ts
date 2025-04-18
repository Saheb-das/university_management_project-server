// internal import
import { CustomError } from "../lib/error";
import batchRepository from "../repository/batch";
import semesterRepository from "../repository/semester";
import subjectRepository from "../repository/subject";
import attendanceRepository from "../repository/attendance";

// types import
import { Attendance } from "@prisma/client";
import {
  IAttendanceQuery,
  IAttendanceStudents,
} from "../controller/attendance";

async function createAttendance(
  filter: IAttendanceQuery,
  attendanceList: IAttendanceStudents
): Promise<Attendance[] | null> {
  try {
    const batch = await batchRepository.findById(filter.batch);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const semester = await semesterRepository.findById(filter.semester);
    if (!semester) {
      throw new CustomError("semester not found", 404);
    }

    const subject = await subjectRepository.findById(filter.subject);
    if (!subject) {
      throw new CustomError("subject not found", 404);
    }

    const attendaceArr = Object.entries(attendanceList).map(([key, value]) => {
      return { studentId: key, status: value };
    });

    const newAttendances = await attendanceRepository.createMany(
      filter,
      attendaceArr
    );
    if (!newAttendances) {
      throw new CustomError("attenances not created", 500);
    }

    return newAttendances;
  } catch (error) {
    console.log("Error create attendance", error);
    return null;
  }
}

// export
export default {
  createAttendance,
};
