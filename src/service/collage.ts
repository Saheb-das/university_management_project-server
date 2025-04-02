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
    // Check if the department already exists
    let newDepartment: Department | null =
      await departmentRepository.findByTypeAndCollageId(
        department.type,
        collageId
      );

    if (!newDepartment) {
      newDepartment = await departmentRepository.create(collageId, department);
      if (!newDepartment) {
        throw new CustomError("Department not created", 500);
      }
    }

    // Process degrees
    const createdDegrees: Degree[] = [];
    for (const degreeType of department.degree) {
      let degree = await degreeRepository.findByTypeAndDeprtId(
        degreeType,
        newDepartment.id
      );

      if (!degree) {
        degree = await degreeRepository.create(newDepartment.id, degreeType);
        if (!degree) {
          throw new CustomError(`Degree ${degreeType} not created`, 500);
        }
      }
      createdDegrees.push(degree);
    }

    // Return department with degrees
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

// export
export default {
  createDepartment,
  getAllDepartments,
  updateCollage,
};
