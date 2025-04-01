// internal import
import prisma from "../lib/prisma";

// types import
import { Profile } from "@prisma/client";
import { TProfile } from "../types";

async function create(payload: TProfile): Promise<Profile | null> {
  const newProfile = await prisma.profile.create({ data: payload });
  return newProfile;
}

// export
export default {
  create,
};
