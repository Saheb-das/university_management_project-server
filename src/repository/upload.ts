// internal import
import prisma from "../lib/prisma";

// types import
import { Profile } from "@prisma/client";

async function update(
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
  update,
};
