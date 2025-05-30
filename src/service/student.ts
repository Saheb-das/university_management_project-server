// internal import
import studentRepository, {
  StudentWithBatch,
  TStudentUpdateStatus,
} from "../repository/student";
import departmentRepository from "../repository/department";
import degreeRepository from "../repository/degree";
import userRepository from "../repository/user";
import batchRepository from "../repository/batch";
import { CustomError } from "../lib/error";

// types import
import { ActiveStatus, Student, User } from "@prisma/client";
import { IStudentFilter } from "../controller/student";

async function getAllStudents(
  studentFilter: IStudentFilter
): Promise<Student[] | null> {
  try {
    if (
      studentFilter &&
      studentFilter.deprt &&
      studentFilter.deg &&
      studentFilter.year
    ) {
      const deprt = await departmentRepository.findByIdWithFilter(
        studentFilter.deprt!
      );
      if (!deprt) {
        throw new CustomError("department not found", 404);
      }

      const degree = await degreeRepository.findByIdWithFilter(
        studentFilter.deg!
      );
      if (!degree) {
        throw new CustomError("degree not found", 404);
      }

      if (!studentFilter.year) {
        throw new CustomError("admission year required", 400);
      }
    }

    const students = await studentRepository.findAll(studentFilter);
    if (!students) {
      throw new CustomError("students not found", 404);
    }

    return students;
  } catch (error) {
    console.log("Error fetching students", error);
    return null;
  }
}

async function getAllStudentsByBatchId(
  batchId: string
): Promise<Student[] | null> {
  try {
    if (!batchId) {
      throw new CustomError("batch id required", 400);
    }

    const batch = await batchRepository.findById(batchId);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const students = await studentRepository.findAllByBatchId(batch.id);
    if (!students) {
      throw new CustomError("students not found", 404);
    }

    return students;
  } catch (error) {
    console.log("Error fetching students", error);
    return null;
  }
}

async function changeActiveStatus(
  studentId: string,
  activeStatus: ActiveStatus
): Promise<TStudentUpdateStatus | null> {
  try {
    const isExist = await studentRepository.findById(studentId);
    if (!isExist) {
      throw new CustomError("student not found", 404);
    }

    const updatedStudent = await studentRepository.updateStatus(
      isExist.id,
      activeStatus
    );
    if (!updatedStudent) {
      throw new CustomError("student not updated", 500);
    }

    return updatedStudent;
  } catch (error) {
    console.log("Error update student's status", error);
    return null;
  }
}

async function getStudentByUserId(
  userId: string
): Promise<StudentWithBatch | null> {
  try {
    if (!userId) {
      throw new CustomError("user id required", 400);
    }

    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new CustomError("student not found", 404);
    }

    return student;
  } catch (error) {
    console.log("Error fetching student", error);
    return null;
  }
}

// export
export default {
  getAllStudents,
  changeActiveStatus,
  getAllStudentsByBatchId,
  getStudentByUserId,
};
