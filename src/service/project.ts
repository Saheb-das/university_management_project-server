// internal import
import studentRepository from "../repository/student";
import projectRepository, { IProject } from "../repository/project";
import { CustomError } from "../lib/error";

// types import
import { Project } from "@prisma/client";
import { TProjectClient } from "../zod/project";

async function createProject(
  userId: string,
  projectInfo: TProjectClient
): Promise<Project | null> {
  try {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new CustomError("user not found", 404);
    }

    const projectPayload: IProject = {
      projectUrl: projectInfo.projectLink,
      title: projectInfo.title,
      type: projectInfo.projectType,
      avatar: projectInfo.projectImg || projectInfo.title,
    };

    const newProject = await projectRepository.create(
      student.id,
      projectPayload
    );
    if (!newProject) {
      throw new CustomError("project not created", 500);
    }

    return newProject;
  } catch (error) {
    console.log("Error create project", error);
    return null;
  }
}

async function getAllProjects(userId: string): Promise<Project[] | null> {
  try {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new CustomError("student not found", 404);
    }

    const projects = await projectRepository.findAllByStudentId(student.id);
    if (!projects) {
      throw new CustomError("projects not found", 404);
    }

    return projects;
  } catch (error) {
    console.log("Error fetching projects", error);
    return null;
  }
}

// export
export default {
  createProject,
  getAllProjects,
};
