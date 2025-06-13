// external import
import prisma from "../lib/prisma";

// types import
import {
  Month,
  Prisma,
  Transaction,
  TransactionMode,
  TransactionType,
  UserRole,
} from "@prisma/client";
import {
  ISalary,
  ITransaction,
  ITutionFee,
  IVerifyOrder,
} from "../types/transaction";

export interface ITranPayload {
  transInfo: ITransaction;
  orderInfo: IVerifyOrder;
  isSalary: boolean;
  feesInfo?: ITutionFee;
  salaryInfo?: ISalary;
}

async function create({
  transInfo,
  orderInfo,
  isSalary,
  feesInfo,
  salaryInfo,
}: ITranPayload): Promise<Transaction | null> {
  const result = await prisma.$transaction(async (tx) => {
    // create transaction
    const newTrans = await tx.transaction.create({
      data: {
        amount: transInfo.amount,
        date: transInfo.date,
        mode: transInfo.mode as TransactionMode,
        type: transInfo.type as TransactionType,
        time: transInfo.time,
        userRole: transInfo.userRole as UserRole,
        utr: transInfo.utr,
        currency: transInfo.currency,
      },
    });

    // create new razorpayTrans model
    const razorTrans = await tx.razorpayTransaction.create({
      data: {
        razorpayOrderId: orderInfo.razorpay_order_id,
        razorpayPaymentId: orderInfo.razorpay_payment_id,
        razorpaySignature: orderInfo.razorpay_signature,
        transactionId: newTrans.id,
      },
    });

    if (isSalary) {
      const isValidSalary =
        salaryInfo && Object.values(salaryInfo).every((item) => item !== "");

      if (!isValidSalary) throw new Error("Salary info required");

      const newSalary = await tx.salary.create({
        data: {
          inMonth: salaryInfo.inMonth as Month,
          performanceBonus: salaryInfo.performanceBonus,
          salaryAmount: salaryInfo.salaryAmount,
          totalAmount: salaryInfo.totalAmount,
          recieverId: salaryInfo.recieverId,
          senderId: salaryInfo.senderId,
          transactionId: newTrans.id,
        },
      });
    } else {
      const isValidFee =
        feesInfo && Object.values(feesInfo).every((item) => item !== "");
      if (!isValidFee) throw new Error("fees info required");

      const newFees = await tx.tutionFee.create({
        data: {
          semNo: feesInfo.semNo,
          lateFine: feesInfo.lateFine,
          semFees: feesInfo.semFees,
          totalAmount: feesInfo.totalAmount,
          isVerified: feesInfo.isVerified,
          senderId: feesInfo.senderId,
          recieverId: feesInfo.recieverId,
          transactionId: newTrans.id,
        },
      });
    }

    return newTrans;
  });

  return result;
}

async function findAll(
  salaryType: boolean = false,
  tutionFeeType: boolean = false
): Promise<Transaction[] | null> {
  const transactions = await prisma.transaction.findMany({
    include: {
      salary: salaryType,
      tutionFee: tutionFeeType,
    },
  });

  return transactions;
}

async function findByType(type: string): Promise<Transaction[] | null> {
  const transactions = await prisma.transaction.findMany({
    where: {
      type: type === "salary" ? "salary" : "tutionFee",
    },
  });

  return transactions;
}

async function findById(
  transactionId: string,
  sType: boolean,
  tType: boolean
): Promise<Transaction | null> {
  const queryCluase = {
    include: {
      reciever: {
        select: {
          id: true,
          bankAccount: true,
        },
      },
      sender: {
        select: {
          id: true,
          bankAccount: true,
        },
      },
    },
  };

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      salary: sType && queryCluase,
      tutionFee: tType && queryCluase,
    },
  });

  return transaction;
}

async function findAllByRoleAndRoleId(
  id: string,
  role: UserRole
): Promise<Transaction[] | null> {
  let whereClause: any;
  let includeClause: any;

  if (role === "student") {
    whereClause = {
      userRole: role,
      tutionFee: {
        senderId: id,
      },
    };

    includeClause = { tutionFee: true };
  } else {
    whereClause = {
      userRole: role,
      salary: {
        recieverId: id,
      },
    };

    includeClause = { salary: true };
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: includeClause,
  });

  return transactions;
}

// export
export default {
  create,
  findAll,
  findById,
  findByType,
  findAllByRoleAndRoleId,
};
