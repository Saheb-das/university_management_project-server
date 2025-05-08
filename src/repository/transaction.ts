// external import
import prisma from "../lib/prisma";

// types import
import {
  Prisma,
  Transaction,
  TransactionMode,
  TransactionType,
  UserRole,
} from "@prisma/client";
import { ITransaction } from "../types/transaction";

async function create(transInfo: ITransaction): Promise<Transaction | null> {
  const newTransaction = await prisma.transaction.create({
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
  return newTransaction;
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
  if (role === "student") {
    whereClause = {
      userRole: role,
      tutionFee: {
        senderId: id,
      },
    };
  } else {
    whereClause = {
      userRole: role,
      salary: {
        recieverId: id,
      },
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
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
