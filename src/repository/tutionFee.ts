// internal import
import prisma from "../lib/prisma";

// types import
import { Month, Prisma, Salary, TutionFee } from "@prisma/client";
import { ITutionFee } from "../types/transaction";

async function create(
  tutionFee: ITutionFee,
  collageId: string
): Promise<TutionFee | null> {
  const result = await prisma.$transaction(async (tx) => {
    const newTutionFee = await tx.tutionFee.create({
      data: {
        semNo: tutionFee.semNo,
        semFees: tutionFee.semFees,
        lateFine: tutionFee.lateFine,
        totalAmount: tutionFee.totalAmount,
        isVerified: tutionFee.isVerified,
        senderId: tutionFee.senderId,
        recieverId: tutionFee.recieverId,
        transactionId: tutionFee.transactionId,
      },
    });

    // calc in revenue
    const includeRevenue = await tx.revenueStats.upsert({
      where: {
        collageId_source_year: {
          collageId: collageId,
          year: newTutionFee.createdAt.getFullYear(),
          source: "fees",
        },
      },
      update: {
        amount: {
          increment: Number(newTutionFee.totalAmount), // Adds to existing amount
        },
      },
      create: {
        amount: Number(newTutionFee.totalAmount),
        source: "fees",
        year: newTutionFee.createdAt.getFullYear(),
        collageId: collageId,
      },
    });

    return newTutionFee;
  });

  return result;
}

export type TFeesTransaction = Prisma.TutionFeeGetPayload<{
  include: {
    transaction: true;
  };
}>;
async function findByStudentBatchIdsAndSemNo(
  studentId: string,
  semNo: number,
  batchId: string
): Promise<TFeesTransaction | null> {
  const fee = await prisma.tutionFee.findFirst({
    where: {
      senderId: studentId,
      semNo: semNo,
      sender: {
        batchId: batchId,
      },
    },
    include: {
      transaction: true,
    },
  });

  return fee;
}

async function verifyFee(feeId: string, tranId: string): Promise<TutionFee> {
  const tranWithFee = await prisma.tutionFee.findFirst({
    where: {
      transactionId: tranId,
    },
  });

  if (!tranWithFee) {
    throw new Error("transaction not found");
  }

  if (feeId !== tranWithFee.id) {
    throw new Error("invalid tution fee id");
  }

  const isVerify = await prisma.tutionFee.update({
    where: {
      id: feeId,
    },
    data: {
      isVerified: true,
    },
  });

  return isVerify;
}

// export
export default {
  create,
  findByStudentBatchIdsAndSemNo,
  verifyFee,
};
