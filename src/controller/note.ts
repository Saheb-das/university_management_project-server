// external import
import { ParsedQs } from "qs";
import path from "path";

// internal import
import { CustomError } from "../lib/error";
import noteService from "../service/note";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

interface INewMaterialPayload {
  title: string;
  batchName: string;
  semNo: string;
  subName: string;
  filePath: string;
}

async function createMaterial(
  req: AuthRequest<INewMaterialPayload>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { title, batchName, semNo, subName, filePath } = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!title) {
      throw new CustomError("title required", 400);
    }

    if (!batchName || !semNo || !subName) {
      throw new CustomError("data required");
    }

    if (!filePath) {
      throw new CustomError("file path required", 400);
    }

    const userId = req.authUser.id;

    const newNote = await noteService.createNote(userId, filePath, {
      batchName,
      semNo,
      subName,
      title,
    });
    if (!newNote) {
      throw new CustomError("note not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "note create successfully",
      note: newNote,
    });
  } catch (error) {
    next(error);
  }
}

async function getNotesByTeacherId(
  req: AuthRequest<{}, { teacherId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { teacherId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unautorized user", 401);
    }

    if (!teacherId) {
      throw new CustomError("teacher stuff id required", 400);
    }

    const notes = await noteService.getNotesByTeacherId(teacherId);
    if (!notes) {
      throw new CustomError("notes not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "notes fetched successfully",
      notes: notes,
    });
  } catch (error) {
    next(error);
  }
}

async function getNoteDoc(
  req: AuthRequest<{}, { noteId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { noteId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!noteId) {
      throw new CustomError("study material id required", 400);
    }

    const noteDocPath = await noteService.getNoteDoc(noteId);
    if (!noteDocPath) {
      throw new CustomError("doc path not found", 404);
    }

    const fullPath = path.join(__dirname, "../..", noteDocPath);

    res.sendFile(fullPath);
  } catch (error) {
    next(error);
  }
}

async function getNotesByBatchId(
  req: AuthRequest<{}, { batchId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!batchId) {
      throw new CustomError("batch id required", 400);
    }

    const notes = await noteService.getNotesByBatchId(batchId);
    if (!notes) {
      throw new CustomError("notes not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "notes fetched successfully",
      notes: notes,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createMaterial,
  getNotesByTeacherId,
  getNoteDoc,
  getNotesByBatchId,
};
