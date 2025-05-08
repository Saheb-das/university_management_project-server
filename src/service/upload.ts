// internal import
import { CustomError } from "../lib/error";
import uploadRepository from "../repository/upload";

async function createUpload(
  userId: string,
  collageId: string,
  avatarPath: string
) {
  try {
    const avatarUploaded = await uploadRepository.create(
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

// export
export default {
  createUpload,
};
