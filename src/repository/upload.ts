// internal import
import prisma from "../lib/prisma";

// types import
import { Collage, Profile } from "@prisma/client";

async function updateAvatar(
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

async function updateLogo(
  collageId: string,
  avatarPath: string
): Promise<Collage | null> {
  const updateLogo = await prisma.collage.update({
    where: {
      id: collageId,
    },
    data: {
      avatar: avatarPath,
    },
  });

  return updateLogo;
}

// export
export default {
  updateAvatar,
  updateLogo,
};
