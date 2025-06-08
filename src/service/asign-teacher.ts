// intennal import
import { CustomError } from "../lib/error";
import stuffRepository from "../repository/stuff";
import batchRepository from "../repository/batch";
import semesterRepository from "../repository/semester";
import subjectRepository from "../repository/subject";
import asignTeacherRepository, {
  AsignTeacherWithBatch,
  TeachersWithSub,
} from "../repository/asignTeacher";
import conversationRepository from "../repository/conversation";
import participantRepository, {
  IParticipant,
  IPartQuery,
  IRemovePart,
} from "../repository/participant";

// types import
import { AsignTeacher } from "@prisma/client";
import { IAsign } from "../repository/asignTeacher";
import { IAsignTeacher } from "../controller/asign-teacher";

async function asignTeacher(
  teacherId: string,
  asignData: IAsignTeacher,
  collageId: string
): Promise<AsignTeacher | null> {
  try {
    const teacher = await stuffRepository.findByIdAndRole(teacherId, "teacher");
    if (!teacher) {
      throw new CustomError("teacher stuff not found", 404);
    }

    const batch = await batchRepository.findByName(asignData.batchName);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const semester = await semesterRepository.findById(asignData.semester);
    if (!semester) {
      throw new CustomError("semester not found", 404);
    }

    const subject = await subjectRepository.findById(asignData.subject);
    if (!subject) {
      throw new CustomError("subject not found", 404);
    }

    const asignPayload: IAsign = {
      teacherId: teacher.id,
      departmentId: batch.departmentId,
      batchId: batch.id,
      semesterId: semester.id,
      subjectId: subject.id,
    };

    const newAsign = await asignTeacherRepository.create(asignPayload);
    if (!newAsign) {
      throw new CustomError("asign teacher not created", 500);
    }

    // join classgroup conversation

    // 1. find batch conversation
    const classgroupCon = await conversationRepository.findByNameAndCollageId({
      conName: `classgroup ${batch.name}`,
      collageId: collageId,
    });
    if (!classgroupCon) {
      throw new CustomError("classgroup conversation not found", 404);
    }

    const partQuery: IPartQuery = {
      collageId: collageId,
      conName: `classgroup ${batch.name}`,
      userId: teacher.profile.userId,
    };

    // 2. if teacher already exist in classgroup, return
    const isParticipant =
      await participantRepository.findByConversationAndUserId(partQuery);
    if (!isParticipant) {
      const partPayload: IParticipant = {
        conId: classgroupCon.id,
        role: "teacher",
        userId: teacher.profile.userId,
      };

      // join to batch conversation
      const addToClassgroup = await participantRepository.create(partPayload);
      if (!addToClassgroup) {
        throw new CustomError("classgroup participant not created", 500);
      }
    }

    return newAsign;
  } catch (error) {
    console.log("Error asigning teacher", error);
    return null;
  }
}

async function getAllSubjects(
  teacherId: string
): Promise<AsignTeacher[] | null> {
  try {
    const teacher = await stuffRepository.findByIdAndRole(teacherId, "teacher");
    if (!teacher) {
      throw new CustomError("teacher not found", 404);
    }

    const subjects = await asignTeacherRepository.findAllSubjectsByTeacherId(
      teacher.id
    );
    if (!subjects) {
      throw new CustomError("subjects not found", 404);
    }

    return subjects;
  } catch (error) {
    console.log("Error find asign subjects", error);
    return null;
  }
}

async function getAllAsignsByTeacherId(
  teacherId: string
): Promise<AsignTeacher[] | null> {
  try {
    const teacher = await stuffRepository.findByIdAndRole(teacherId, "teacher");
    if (!teacher) {
      throw new CustomError("teacher not found", 404);
    }

    const asigns = await asignTeacherRepository.findAllByTeacherId(teacher.id);
    if (!asigns) {
      throw new CustomError("asigns not found", 404);
    }

    return asigns;
  } catch (error) {
    console.log("Error find asigns", error);
    return null;
  }
}

async function removeSubjectFromTeacher(
  teacherId: string,
  subjectId: string,
  collageId: string
): Promise<AsignTeacher | null> {
  try {
    const teacher = await stuffRepository.findByIdAndRole(teacherId, "teacher");
    if (!teacher) {
      throw new CustomError("teacher not found", 404);
    }

    const removedSubject = await asignTeacherRepository.remove(
      teacherId,
      subjectId
    );
    if (!removedSubject) {
      throw new CustomError("subject not removed", 500);
    }

    // remove from conversation
    const batches = await asignTeacherRepository.findAllByTeacherId(teacher.id);
    if (!batches) {
      throw new CustomError("batches not found", 404);
    }

    const teacherBatchesArr: string[] = [];

    // store unique batch name
    batches.forEach((item) => {
      if (!teacherBatchesArr.includes(item.batch.name)) {
        teacherBatchesArr.push(item.batch.name);
      }
    });

    if (!teacherBatchesArr.includes(removedSubject.batch.name)) {
      const removePayload: IRemovePart = {
        conName: removedSubject.batch.name,
        userId: teacher.profile.userId,
        collageId: collageId,
        role: "teacher",
      };
      // remove participant from conversation
      const removedPart = await participantRepository.remove(removePayload);
      if (!removedPart) {
        throw new CustomError("participant not removed", 500);
      }
    }

    return removedSubject;
  } catch (error) {
    console.log("Error remove subject", error);
    return null;
  }
}

async function getAllBatchesByTeacherUserId(
  userId: string
): Promise<AsignTeacherWithBatch[] | null> {
  try {
    if (!userId) {
      throw new CustomError("user id required", 400);
    }

    const teacherStuff = await stuffRepository.findByUserId(userId);
    if (!teacherStuff) {
      throw new CustomError("teacher stuff not found", 404);
    }

    const asignTeachers = await asignTeacherRepository.findAllByTeacherId(
      teacherStuff.id
    );
    if (!asignTeachers) {
      throw new CustomError("asign teachers not found", 404);
    }

    return asignTeachers;
  } catch (error) {
    console.log("Error fetching asign teachers", error);
    return null;
  }
}

async function getAllTeachersByBatchAndSemIds(
  batchId: string,
  semId: string
): Promise<TeachersWithSub[] | null> {
  try {
    const batch = await batchRepository.findByIdAndSemId(batchId, semId);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const asignedTeachers =
      await asignTeacherRepository.findAllTeachersBybatchAndSemId(
        batchId,
        semId
      );
    if (asignedTeachers && asignedTeachers.length === 0) {
      throw new CustomError("asigned teachers not found", 404);
    }

    return asignedTeachers;
  } catch (error) {
    console.log("Error fetching asigned teachers", error);
    return null;
  }
}

// export
export default {
  asignTeacher,
  getAllSubjects,
  getAllBatchesByTeacherUserId,
  getAllAsignsByTeacherId,
  getAllTeachersByBatchAndSemIds,
  removeSubjectFromTeacher,
};
