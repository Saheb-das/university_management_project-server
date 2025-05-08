// internal import
import collageRepository from "../repository/collage";
import departmentRepository from "../repository/department";
import degreeRepository from "../repository/degree";

// types import
import { Collage, Department, Degree } from "@prisma/client";
import { ICollageUpdate } from "../types";
import { CustomError } from "../lib/error";

export type TDeaprtmentType =
  | "engineering"
  | "medical"
  | "law"
  | "management"
  | "internal";

type TDegree = "bachelor" | "master" | "phd" | "diploma";

export interface IDeprtInfo {
  type: TDeaprtmentType;
  degree: TDegree[];
}

async function createDepartment(
  collageId: string,
  department: IDeprtInfo
): Promise<Department | null> {
  try {
    const isExist = await departmentRepository.findByTypeAndCollageId(
      department.type,
      collageId
    );
    if (isExist) {
      throw new CustomError("department all ready exists");
    }

    const newDepartment = await departmentRepository.create(
      collageId,
      department
    );

    if (!newDepartment) {
      throw new CustomError("department not created", 500);
    }
    return newDepartment;
  } catch (error) {
    console.log("Error creating department", error);
    return null;
  }
}

async function getAllDepartments(
  collageId: string,
  degree: boolean
): Promise<Department[] | null> {
  try {
    const departments = await departmentRepository.findAllByCollageId(
      collageId,
      degree
    );
    if (!departments) {
      throw new CustomError("departments not found", 404);
    }

    return departments;
  } catch (error) {
    console.log("Error find departments", error);
    return null;
  }
}

async function updateCollage(
  data: ICollageUpdate,
  collageId: string
): Promise<Collage | null> {
  try {
    const updatedCollage = await collageRepository.update(data, collageId);
    if (!updateCollage) {
      throw new CustomError("collage update failed", 500);
    }
    return updatedCollage;
  } catch (error) {
    console.log("Error updating collage", error);
    return null;
  }
}

async function getCollageById(id: string): Promise<Collage | null> {
  try {
    const collage = await collageRepository.findById(id);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    return collage;
  } catch (error) {
    console.log("Error finding collage", error);
    return null;
  }
}

// export
export default {
  createDepartment,
  getAllDepartments,
  updateCollage,
  getCollageById,
};
