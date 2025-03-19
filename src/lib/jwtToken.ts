// external imports
import jwt, { JwtPayload } from "jsonwebtoken";

// type import
import { TRole } from "../types/auth";

// user payload for jwt payload
interface IJwtPayload {
  id: string;
  role: TRole;
  email: string;
  collageId: string;
}

// generate access token ( or auth token )
function genJwtAccessToken(payload: IJwtPayload): string {
  return `Bearer ${jwt.sign(payload, process.env.SECRET_KEY || "secreat_key")}`;
}

// verify access token
function verifyAccessToken(token: string): JwtPayload | null {
  const decoded = jwt.verify(token, process.env.SECRET_KEY || "secreat_key");

  if (typeof decoded === "string") {
    return JSON.parse(decoded);
  } else if (typeof decoded === "object" && decoded !== null) {
    return decoded as JwtPayload;
  } else {
    return null;
  }
}

// exports
export { genJwtAccessToken, verifyAccessToken };
