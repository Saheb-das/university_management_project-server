// internal import
import prisma from "../lib/prisma";

// types import
import { Profile } from "@prisma/client";

async function create(
  userId: string,
  collageId: string,
  avatarPath: string
): Promise<Profile | null> {
  const updateAvatar = await prisma.profile.update({
    where: {
      userId: userId,
      user: {
        collageId: collageId,
      },
    },
    data: {
      avatar: avatarPath,
    },
  });

  return updateAvatar;
}

// export
export default {
  create,
};
