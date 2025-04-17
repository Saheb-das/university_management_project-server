// types import
import { IStudentFilter } from "../controller/student";

export function studentSearchFilter(filter: IStudentFilter): boolean {
  const hasAny =
    filter.deprt !== undefined ||
    filter.deg !== undefined ||
    filter.year !== undefined;
  const hasAll =
    filter.deprt !== undefined &&
    filter.deg !== undefined &&
    filter.year !== undefined;

  return !hasAny || hasAll;
}
