// internal import
import { CustomError } from "../lib/error";
import { projectSchema } from "../zod/project";
import projectService from "../service/project";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { TProjectClient } from "../zod/project";

async function createProject(
  req: AuthRequest<TProjectClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const userId = req.authUser.id;

    const isValid = projectSchema.safeParse(req.body);
    if (!isValid.success) {
      throw new CustomError("invalid input", 400, isValid.error);
    }

    const newProject = await projectService.createProject(userId, isValid.data);
    if (!newProject) {
      throw new CustomError("project not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "project created successfully",
      newProject: newProject,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjects(
  req: AuthRequest<{}, {}, { user: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { user } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!user) {
      throw new CustomError("user id required", 400);
    }

    const projects = await projectService.getAllProjects(user);
    if (!projects) {
      throw new CustomError("projects not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "project created successfully",
      projects: projects,
    });
  } catch (error) {
    next(error);
  }
}

async function getProject() {}
async function updateProject() {}
async function deleteProject() {}

// export
export default {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
