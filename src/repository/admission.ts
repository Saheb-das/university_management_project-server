import { Admission } from "@prisma/client";
import prisma from "../lib/prisma";

export type TAdmission = Omit<Admission, "createdAt" | "updatedAt" | "id">;

async function create(payload: TAdmission): Promise<Admission | null> {
  const newAdmission = await prisma.admission.create({
    data: payload,
  });

  return newAdmission;
}

export default {
  create,
};
