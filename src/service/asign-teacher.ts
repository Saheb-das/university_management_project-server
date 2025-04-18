// intennal import
import { CustomError } from "../lib/error";
import stuffRepository from "../repository/stuff";
import batchRepository from "../repository/batch";
import semesterRepository from "../repository/semester";
import subjectRepository from "../repository/subject";
import asignTeacherRepository from "../repository/asignTeacher";

// types import
import { AsignTeacher } from "@prisma/client";
import { IAsign } from "../repository/asignTeacher";
import { IAsignTeacher } from "../controller/asign-teacher";

async function asignTeacher(
  teacherId: string,
  asignData: IAsignTeacher
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

async function removeSubjectFromTeacher(
  teacherId: string,
  subjectId: string
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

    return removedSubject;
  } catch (error) {
    console.log("Error remove subject", error);
    return null;
  }
}

// export
export default {
  asignTeacher,
  getAllSubjects,
  removeSubjectFromTeacher,
};
