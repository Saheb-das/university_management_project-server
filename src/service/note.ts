// internal import
import stuffRepository from "../repository/stuff";
import batchRepository from "../repository/batch";
import noteRepository, {
  TNoteWithSub,
  TNoteWithTeacherAndSub,
} from "../repository/note";
import subjectRepository from "../repository/subject";
import semesterRepository from "../repository/semester";
import { CustomError } from "../lib/error";

// types import
import { Note } from "@prisma/client";
import { INote } from "../repository/note";

interface IPayload {
  title: string;
  batchName: string;
  semNo: string;
  subName: string;
}
async function createNote(
  userId: string,
  filePath: string,
  data: IPayload
): Promise<Note | null> {
  try {
    const stuff = await stuffRepository.findByUserId(userId);
    if (!stuff) {
      throw new CustomError("stuff not found", 404);
    }

    const batchWithSem = await batchRepository.findByBatchNameWithSemesters(
      data.batchName
    );
    if (!batchWithSem) {
      throw new CustomError("batch with semester not found", 404);
    }

    const semester = batchWithSem.course.semesters.find((sem) => {
      if (sem.semNo === Number(data.semNo)) {
        return sem;
      }
    });
    if (!semester) {
      throw new CustomError("invalid semester no", 400);
    }

    const subjects = await subjectRepository.findAllBySemesterId(semester.id);
    if (!subjects) {
      throw new CustomError("subjects not found", 404);
    }

    const subject = subjects.find((sub) => {
      if (sub.name === data.subName) {
        return sub;
      }
    });
    if (!subject) {
      throw new CustomError("invalid subject name", 400);
    }

    const notePayload: INote = {
      title: data.title,
      batchId: batchWithSem.id,
      fileUrl: filePath,
      semesterId: semester.id,
      teacherId: stuff.id,
      subjectId: subject.id,
    };

    const newNote = await noteRepository.create(notePayload);
    if (!newNote) {
      throw new CustomError("note not created", 500);
    }

    return newNote;
  } catch (error) {
    console.log("Error create note", error);
    return null;
  }
}

async function getNotesByTeacherId(teacherId: string): Promise<Note[] | null> {
  try {
    const teacher = await stuffRepository.findById(teacherId);
    if (!teacher) {
      throw new CustomError("teacher not found", 404);
    }

    const notes = await noteRepository.findAllByTeacherId(teacherId);
    if (!notes) {
      throw new CustomError("notes not found", 404);
    }

    return notes;
  } catch (error) {
    console.log("Error fetching notes", error);
    return null;
  }
}

async function getNoteDoc(noteId: string): Promise<string | null> {
  try {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new CustomError("note not found", 404);
    }

    return note.fileUrl;
  } catch (error) {
    console.log("Error fetching note", error);
    return null;
  }
}

async function getNotesByBatchId(
  batchId: string
): Promise<TNoteWithSub[] | null> {
  try {
    const batch = await batchRepository.findById(batchId);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const notes = await noteRepository.findAllByBatchId(batchId);
    if (!notes) {
      throw new CustomError("notes not found", 404);
    }

    return notes;
  } catch (error) {
    console.log("Error fetching notes", error);
    return null;
  }
}

async function getAllNotesByBatchAndSem(
  batchId: string,
  semId: string
): Promise<TNoteWithTeacherAndSub[] | []> {
  try {
    const batch = await batchRepository.findById(batchId);
    if (!batch) {
      throw new CustomError("batch not found", 404);
    }

    const sem = await semesterRepository.findById(semId);
    if (!sem) {
      throw new CustomError("semester not found", 404);
    }

    const notes = await noteRepository.findAllByBatchAndSemIds(batchId, semId);
    if (!notes) {
      throw new CustomError("notes not found", 404);
    }

    return notes;
  } catch (error) {
    console.log("Error fetching notes", error);
    return [];
  }
}

// export
export default {
  createNote,
  getNotesByTeacherId,
  getNoteDoc,
  getNotesByBatchId,
  getAllNotesByBatchAndSem,
};
