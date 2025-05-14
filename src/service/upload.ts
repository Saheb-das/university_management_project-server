// external import
import fs from "fs";

// internal import
import { CustomError } from "../lib/error";
import uploadRepository from "../repository/upload";

async function changeAvatar(
  userId: string,
  collageId: string,
  avatarPath: string,
  oldPath: string
) {
  try {
    if (oldPath) {
      // delete old uploaded file
      fs.unlinkSync(oldPath);
    }

    const avatarUploaded = await uploadRepository.updateAvatar(
      userId,
      collageId,
      avatarPath
    );
    if (!avatarUploaded) {
      throw new CustomError("avatar not updated", 500);
    }

    return avatarUploaded;
  } catch (error) {
    console.log("Error uploading avatar", error);
    return null;
  }
}

async function changeLogo(
  collageId: string,
  logoPath: string,
  oldPath: string
) {
  try {
    if (oldPath) {
      // delete old uploaded file
      fs.unlinkSync(oldPath);
    }

    const avatarUploaded = await uploadRepository.updateLogo(
      collageId,
      logoPath
    );
    if (!avatarUploaded) {
      throw new CustomError("avatar not updated", 500);
    }

    return avatarUploaded;
  } catch (error) {
    console.log("Error uploading avatar", error);
    return null;
  }
}

// export
export default {
  changeAvatar,
  changeLogo,
};
