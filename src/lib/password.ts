// external imports
import bcrypt from "bcrypt";

// generate hashed password
async function genHashedPassword(clientPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(clientPassword, salt);
  return hashed;
}

// compare hashed password
async function compareHashedPassword(
  clientPass: string,
  storedhashedPass: string
): Promise<boolean> {
  const isValidPassword = await bcrypt.compare(clientPass, storedhashedPass);
  return isValidPassword;
}

// exports
export { genHashedPassword, compareHashedPassword };
