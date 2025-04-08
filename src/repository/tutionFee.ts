// internal import
import prisma from "../lib/prisma";

// types import
import { Month, Salary, TutionFee } from "@prisma/client";
import { ITutionFee } from "../types/transaction";

async function create(tutionFee: ITutionFee): Promise<TutionFee | null> {
  const newTutionFee = await prisma.tutionFee.create({
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

  return newTutionFee;
}

// export
export default {
  create,
};
