import { Note } from "@prisma/client";
import prisma from "../lib/prisma";

export interface INote {
  title: string;
  fileUrl: string;
  batchId: string;
  semesterId: string;
  teacherId: string;
  subjectId: string;
}

async function create(payload: INote): Promise<Note | null> {
  const newNote = await prisma.note.create({
    data: {
      title: payload.title,
      date: new Date(),
      fileUrl: payload.fileUrl,
      batchId: payload.batchId,
      semesterId: payload.semesterId,
      teacherId: payload.teacherId,
      subjectId: payload.subjectId,
    },
  });

  return newNote;
}

async function findById(noteId: string): Promise<Note | null> {
  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  return note;
}

async function findAllByTeacherId(teacherId: string): Promise<Note[] | null> {
  const notes = await prisma.note.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      semester: {
        select: {
          id: true,
          semNo: true,
        },
      },
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return notes;
}

// export
export default {
  create,
  findAllByTeacherId,
  findById,
};
