// internal import
import { CustomError } from "../lib/error";
import departmentRepository from "../repository/department";
import degreeRepository from "../repository/degree";
import courseRepository from "../repository/course";
import batchRepository from "../repository/batch";

// types import
import { Batch } from "@prisma/client";
import { IBatchClient } from "../controller/batch";
import { getAbbreviation } from "../utils/titleGenerator";

export interface IBatch {
  name: string;
  batchYear: string;
  departmentId: string;
  courseId: string;
}

async function createBatch(batchInfo: IBatchClient): Promise<Batch | null> {
  try {
    const isExistDeprt = await departmentRepository.findByIdWithFilter(
      batchInfo.departmentId
    );
    if (!isExistDeprt) {
      throw new CustomError("department not found", 404);
    }

    const isExistDegree = await degreeRepository.findByIdWithFilter(
      batchInfo.degreeId,
      "departmentId",
      isExistDeprt.id
    );
    if (!isExistDegree) {
      throw new CustomError("degree not found", 404);
    }

    const isExistCourse = await courseRepository.findByIdWithFilter(
      batchInfo.courseId,
      "degreeId",
      isExistDegree.id
    );
    if (!isExistCourse) {
      throw new CustomError("course not found", 404);
    }

    const newBatchTitle = `${batchInfo.degreeType}-${getAbbreviation(
      batchInfo.courseName
    )}-${batchInfo.addmissionYear}`;

    const payload: IBatch = {
      name: newBatchTitle,
      batchYear: batchInfo.addmissionYear,
      departmentId: batchInfo.departmentId,
      courseId: batchInfo.courseId,
    };

    const newBatch = await batchRepository.create(payload);
    if (!newBatch) {
      throw new CustomError("batch not created", 500);
    }

    return newBatch;
  } catch (error) {
    console.log("Error create batch", error);
    return null;
  }
}

interface IBatchOpts {
  department: boolean;
  course: boolean;
}

async function getBatchByName(
  batchName: string,
  opt: IBatchOpts
): Promise<Batch | null> {
  try {
    if (!batchName) {
      throw new CustomError("batch name required", 400);
    }

    const batch = await batchRepository.findByName(batchName, {
      includeDepartment: opt.department,
      includeCourse: opt.course,
    });
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    return batch;
  } catch (error) {
    console.log("Error finding batch", error);
    return null;
  }
}

// export
export default {
  createBatch,
  getBatchByName,
};
