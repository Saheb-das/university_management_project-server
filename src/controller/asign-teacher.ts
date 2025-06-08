// internal import
import { CustomError } from "../lib/error";
import asignTeacherService from "../service/asign-teacher";

// types import
import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

export interface IAsignTeacher {
  batchName: string;
  semester: string;
  subject: string;
}

async function asignTeacher(
  req: AuthRequest<IAsignTeacher, { teacherId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchName, semester, subject } = req.body;
  const { teacherId } = req.params;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    if (!batchName || !semester || !subject) {
      throw new CustomError("invalid input");
    }

    const asignData = req.body;

    const asignTeacher = await asignTeacherService.asignTeacher(
      teacherId,
      asignData,
      collageId
    );
    if (!asignTeacher) {
      throw new CustomError("teacher not asigned", 500);
    }

    res.status(200).json({
      success: true,
      message: "teacher asigned successfully",
      asigned: asignTeacher,
    });
  } catch (error) {
    next(error);
  }
}

async function getSubjects(
  req: AuthRequest<{}, { teacherId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { teacherId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!teacherId) {
      throw new CustomError("teacher stuff id required");
    }

    const subjects = await asignTeacherService.getAllSubjects(teacherId);
    if (!subjects) {
      throw new CustomError("subjects not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      asignSubjects: subjects,
    });
  } catch (error) {
    next(error);
  }
}

async function getBatchesByTeacherUserId(
  req: AuthRequest<{}, {}, { userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!userId) {
      throw new CustomError("teacher stuff id required");
    }

    const batches = await asignTeacherService.getAllBatchesByTeacherUserId(
      userId
    );
    if (!batches) {
      throw new CustomError("batches not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "batches fetched successfully",
      batches: batches,
    });
  } catch (error) {
    next(error);
  }
}

async function getTeachersByBatchAndSem(
  req: AuthRequest<{}, { batchId: string; semId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchId, semId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!batchId || !semId) {
      throw new CustomError("batch and sem id required");
    }

    const asignedTeachers =
      await asignTeacherService.getAllTeachersByBatchAndSemIds(batchId, semId);
    if (!asignedTeachers) {
      throw new CustomError("asigned teachers not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "batches fetched successfully",
      asignedTeachers: asignedTeachers,
    });
  } catch (error) {
    next(error);
  }
}

async function removeSubjectFromTeacher(
  req: AuthRequest<{}, { teacherId: string }, { subject: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { teacherId } = req.params;
  const { subject } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    if (!teacherId) {
      throw new CustomError("teacher stuff id required", 400);
    }

    if (!subject) {
      throw new CustomError("subject id required", 400);
    }

    const removedSubject = await asignTeacherService.removeSubjectFromTeacher(
      teacherId,
      subject,
      collageId
    );
    if (!removedSubject) {
      throw new CustomError("subject not removed", 500);
    }

    res.status(200).json({
      success: true,
      message: "subject removed successfully",
      removedSubject: removedSubject,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  asignTeacher,
  getSubjects,
  removeSubjectFromTeacher,
  getBatchesByTeacherUserId,
  getTeachersByBatchAndSem,
};
