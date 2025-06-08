// internal import
import { CustomError } from "../lib/error";
import batchRepository from "../repository/batch";
import semesterRepository from "../repository/semester";
import subjectRepository from "../repository/subject";
import attendanceRepository, {
  IAttendCount,
  IAttendCountProps,
} from "../repository/attendance";
import studentRepository from "../repository/student";

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

async function getAttendanceCount(
  query: IAttendCountProps
): Promise<IAttendCount | null> {
  try {
    const student = await studentRepository.findById(query.studentId);
    if (!student) {
      throw new CustomError("student not found", 404);
    }

    if (query.batchId !== student.batchId) {
      throw new CustomError("invalid batch", 400);
    }

    const sem = await semesterRepository.findById(query.semesterId);
    if (!sem) {
      throw new CustomError("semester not found", 404);
    }

    const attendanceCount = await attendanceRepository.findByStudentIdAndCount(
      query
    );
    if (!attendanceCount) {
      throw new CustomError("attenances not count", 500);
    }

    return attendanceCount;
  } catch (error) {
    console.log("Error count attendance", error);
    return null;
  }
}

// export
export default {
  createAttendance,
  getAttendanceCount,
};
