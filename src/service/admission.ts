// internal import
import { CustomError } from "../lib/error";
import stuffRepository from "../repository/stuff";
import admissionRepository from "../repository/admission";
import batchRepository from "../repository/batch";
import { calcCommission } from "../utils/commission";
import { genHashedPassword } from "../lib/password";
import degreeRepository from "../repository/degree";
import conversationRepository from "../repository/conversation";
import participantRepository from "../repository/participant";

// types import
import { Admission } from "@prisma/client";
import { TStudentClient } from "../zod/user";

export interface IIds {
  departmentId: string;
  courseId: string;
  batchId: string;
  degreeId: string;
}

async function createAdmission(
  payload: TStudentClient,
  collageId: string,
  userId: string
): Promise<Admission | null> {
  try {
    const hashedPassword = await genHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new CustomError("password not hashed", 500);
    }

    const stuff = await stuffRepository.findByUserId(userId);
    if (!stuff) {
      throw new CustomError("stuff not found", 404);
    }

    const isExistBatch = await batchRepository.findByName(payload.batch, {
      includeDepartment: true,
      includeCourse: true,
    });
    if (!isExistBatch) {
      throw new CustomError(`${payload.batch} batch not found`, 404);
    }

    if (!isExistBatch.department) {
      throw new CustomError("department not retrive", 404);
    }

    if (!isExistBatch.course) {
      throw new CustomError("course not retrive", 404);
    }

    const isExistDegree = await degreeRepository.findByIdWithFilter(
      isExistBatch.course.degreeId
    );
    if (!isExistDegree) {
      throw new CustomError("degree not found", 404);
    }

    const commissionIncome = calcCommission({
      courseName: isExistBatch.course.name,
      degreeType: isExistDegree.type,
      departmentType: isExistBatch.department.type,
      role: "stuff",
    });

    const studentPayload: TStudentClient = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      adhaarNo: payload.adhaarNo,
      address: payload.address,
      phoneNo: payload.phoneNo,
      dob: payload.dob,
      guardianName: payload.guardianName,
      relWithGuardian: payload.relWithGuardian,
      admissionYear: payload.admissionYear,
      gradeAtSec: payload.gradeAtSec,
      gradeAtHigherSec: payload.gradeAtHigherSec,
      batch: payload.batch,
    };

    const idsPayload: IIds = {
      departmentId: isExistBatch.departmentId,
      courseId: isExistBatch.courseId,
      batchId: isExistBatch.id,
      degreeId: isExistBatch.course.degreeId,
    };

    const newAdmission = await admissionRepository.create(
      studentPayload,
      collageId,
      idsPayload,
      stuff.id,
      commissionIncome
    );
    if (!newAdmission) {
      throw new CustomError("student not created", 500);
    }

    // join classgroup and other conversation

    // find announcement conversation
    const announcementCon = await conversationRepository.findByNameAndCollageId(
      { conName: "announcement", collageId: collageId }
    );
    if (!announcementCon) {
      throw new CustomError("announcement conversation not found", 404);
    }

    // find dropbox conversation
    const dropboxCon = await conversationRepository.findByNameAndCollageId({
      conName: "dropbox",
      collageId: collageId,
    });
    if (!dropboxCon) {
      throw new CustomError("dropbox conversation not found", 404);
    }

    // add to announcement conversation
    const addToAnnouncement = await participantRepository.create({
      conId: announcementCon.id,
      role: payload.role,
      userId: newAdmission.student.profile.userId,
    });
    if (!addToAnnouncement) {
      throw new CustomError("announcement participant not created", 500);
    }

    // add to dropbox conversation
    const addToDropbox = await participantRepository.create({
      conId: dropboxCon.id,
      role: payload.role,
      userId: newAdmission.student.profile.userId,
    });
    if (!addToDropbox) {
      throw new CustomError("dropbox participant not created", 500);
    }

    // create classgroup conversation
    const classgroupCon = await conversationRepository.create({
      conName: `classgroup ${isExistBatch.name}`,
      collageId: collageId,
    });
    if (!classgroupCon) {
      throw new CustomError("classgroup conversation not created", 500);
    }

    return newAdmission;
  } catch (error) {
    console.log("Error create admission", error);
    return null;
  }
}

async function getAllAdmissions(
  stuffId: string = ""
): Promise<Admission[] | null> {
  try {
    if (stuffId) {
      const stuff = await stuffRepository.findById(stuffId);
      if (!stuff) {
        throw new CustomError("stuff not found", 404);
      }
    }

    const admissions = await admissionRepository.findAllByStuffId(stuffId);
    if (!admissions) {
      throw new CustomError("admissions not found", 404);
    }

    return admissions;
  } catch (error) {
    console.log("Error finding admissions", error);
    return null;
  }
}

// export
export default {
  createAdmission,
  getAllAdmissions,
};
