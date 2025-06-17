// internal import
import stuffRepository from "../repository/stuff";
import collageRepository from "../repository/collage";
import batchRepository from "../repository/batch";
import degreeRepository from "../repository/degree";
import conversationRepository from "../repository/conversation";
import participantRepository from "../repository/participant";
import { CustomError } from "../lib/error";
import { calcCommission } from "../utils/commission";
import { genHashedPassword } from "../lib/password";
import admissionRepository, {
  TAdmissionStats,
  TAdmissionWithCommission,
  TAdmissionWithDetails,
  TLastYearTopper,
} from "../repository/admission";

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

    // Find or create class group conversation
    let group = await conversationRepository.findByNameAndCollageId({
      conName: `classroom ${isExistBatch.name}`,
      collageId,
    });

    if (!group) {
      group = await conversationRepository.create({
        conName: `classroom ${isExistBatch.name}`,
        collageId,
      });
      if (!group)
        throw new CustomError("classroom conversation not created", 500);
    }

    // Add participant to the group
    const added = await participantRepository.create({
      conId: group.id,
      role: payload.role,
      userId: newAdmission.student.profile.userId,
    });

    if (!added) {
      throw new CustomError("classroom participant not created", 500);
    }

    return newAdmission;
  } catch (error) {
    console.log("Error create admission", error);
    throw error;
  }
}

async function getAllAdmissions(
  userId: string = ""
): Promise<TAdmissionWithDetails[] | null> {
  try {
    let stuffId = "";
    if (userId) {
      const stuff = await stuffRepository.findByUserId(userId);
      if (!stuff) {
        throw new CustomError("stuff not found", 404);
      }

      stuffId = stuff.id;
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

async function getTotalAdmissionAndCommission(
  userId: string
): Promise<TAdmissionWithCommission | null> {
  try {
    const stuff = await stuffRepository.findByUserId(userId);
    if (!stuff) {
      throw new CustomError("stuff not found", 404);
    }

    const totalAddmitAndCom =
      await admissionRepository.findTotalAdmissionAndCommission(stuff.id);
    if (!totalAddmitAndCom) {
      throw new CustomError("total admission and commission not found", 404);
    }

    return totalAddmitAndCom;
  } catch (error) {
    console.log("Error fetch total admission and commission", error);
    return null;
  }
}

async function getLastFiveYearsStats(
  userId: string
): Promise<TAdmissionStats[] | null> {
  try {
    const stuff = await stuffRepository.findByUserId(userId);
    if (!stuff) {
      throw new CustomError("stuff not found", 404);
    }

    const stats = await admissionRepository.findLastFiveYearStats(stuff.id);
    if (!stats) {
      throw new CustomError("last five years not found", 404);
    }

    return stats;
  } catch (error) {
    console.log("Error fetching last five years stats", error);
    return null;
  }
}

async function getTopThreeInLastYear(
  collageId: string
): Promise<TLastYearTopper[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const topThree = await admissionRepository.findTopThreeInLastYear(
      collage.id
    );
    if (!topThree) {
      throw new CustomError("top three counsellors not found", 404);
    }

    return topThree;
  } catch (error) {
    console.log("Error fetchingtop three counsellors", error);
    return null;
  }
}

// export
export default {
  createAdmission,
  getAllAdmissions,
  getTotalAdmissionAndCommission,
  getLastFiveYearsStats,
  getTopThreeInLastYear,
};
