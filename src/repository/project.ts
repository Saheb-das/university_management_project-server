// types import
import { Project, ProjectType } from "@prisma/client";
import prisma from "../lib/prisma";

export interface IProject {
  projectUrl: string;
  title: string;
  type: ProjectType;
  avatar?: string;
}
async function create(
  studentId: string,
  payload: IProject
): Promise<Project | null> {
  const result = await prisma.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        date: new Date(),
        projectUrl: payload.projectUrl,
        title: payload.title,
        type: payload.type,
        avatat: payload.avatar,
      },
    });

    // student on project
    const studentProject = await tx.studentsOnProjects.create({
      data: {
        studentId: studentId,
        projectId: newProject.id,
      },
    });

    return newProject;
  });

  return result;
}

async function findAllByStudentId(
  studentId: string
): Promise<Project[] | null> {
  const projects = await prisma.project.findMany({
    where: {
      studentsOnProjects: {
        some: {
          studentId: studentId,
        },
      },
    },
  });

  return projects;
}

// export
export default {
  create,
  findAllByStudentId,
};
