// internal import
import prisma from "../lib/prisma";

// types import
import { Attendance } from "@prisma/client";
import { IAttendanceQuery } from "../controller/attendance";

type TAttendanceArr = {
  studentId: string;
  status: boolean;
};

async function createMany(
  filter: IAttendanceQuery,
  attendanceArr: TAttendanceArr[]
): Promise<Attendance[] | null> {
  const result = await prisma.$transaction(async (tx) => {
    let newAttendances: any = [];
    for (const att of attendanceArr) {
      const newAtt = await tx.attendance.create({
        data: {
          sessionDate: new Date(),
          status: att.status ? "present" : "absent",
          batchId: filter.batch,
          semesterId: filter.semester,
          subjectId: filter.subject,
          studentId: att.studentId,
        },
      });

      newAttendances.push(newAtt);
    }
    return newAttendances;
  });
  return result;
}

// export
export default {
  createMany,
};
