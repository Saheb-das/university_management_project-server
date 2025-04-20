// external import
import { ParsedQs } from "qs";
import path from "path";

// internal import
import { CustomError } from "../lib/error";
import noteService, { IFileDetails } from "../service/note";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export interface IMaterialQuery extends ParsedQs {
  sub: string;
  batch: string;
  sem: string;
}

async function createMaterial(
  req: AuthRequest<{ title: string }, {}, IMaterialQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { title } = req.body;
  const { batch, sem, sub } = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!req.file) {
      throw new CustomError("invalid request field", 500);
    }

    if (!title) {
      throw new CustomError("title required", 400);
    }

    if (!batch || !sem || !sub) {
      throw new CustomError("query params required");
    }

    const userId = req.authUser.id;

    const fileDetails: IFileDetails = {
      name: req.file.filename,
      path: req.file.destination,
    };

    const newNote = await noteService.createNote(
      userId,
      title,
      fileDetails,
      req.query
    );
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

// export
export default {
  createMaterial,
  getNotesByTeacherId,
  getNoteDoc,
};
