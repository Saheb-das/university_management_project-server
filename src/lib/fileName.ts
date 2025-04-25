// external import
import path from "path";

// types import
import { UserRole } from "@prisma/client";

interface IAuthUser {
  id: string;
  role: UserRole;
  collageId: string;
  email: string;
}

interface IExtraData {
  batch?: string;
  sem?: string;
  sub?: string;
}

const getFileName = (
  file: Express.Multer.File,
  authUser: IAuthUser,
  extraData: IExtraData = {}
) => {
  const ext = path.extname(file.originalname);
  const timestamp = Date.now();
  let fileName;

  switch (file.fieldname) {
    case "profilePic":
      fileName = `profile_${authUser.role}_${authUser.id}_${timestamp}${ext}`;
      break;

    case "document":
      fileName = `doc_${extraData.batch}_${extraData.sem}_${extraData.sub}_${timestamp}${ext}`;
      break;

    case "project":
      fileName = `project_${authUser.role}_${authUser.id}_${timestamp}${ext}`;
      break;

    case "event":
      fileName = `event_${authUser.collageId}_${timestamp}${ext}`;
      break;

    default:
      fileName = `file_${timestamp}${ext}`;
  }

  return fileName;
};

// export
export { getFileName };
