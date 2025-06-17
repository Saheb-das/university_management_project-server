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

async function findAllByQuery(
  date?: string,
  type?: "salary" | "tutionFee"
): Promise<Transaction[] | []> {
  const now = new Date();

  const whereClause: Record<string, any> = {};

  // Filter by date if provided
  if (date) {
    const fromDate = new Date(date);
    if (isNaN(fromDate.getTime())) {
      throw new Error("Invalid date format");
    }

    whereClause.createdAt = {
      gte: fromDate,
      lte: now,
    };
  }

  // Filter by transaction type (based on related model field)
  if (type) {
    whereClause.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: !date && !type ? 100 : undefined,
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

async function findPrevMonthByStuffId(
  stuffId: string
): Promise<Transaction | null> {
  const now = new Date();

  // Get start of current month (e.g., June 1)
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get start of next month (e.g., July 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Get previous month's name
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let prevMonthIndex = now.getMonth() - 1;

  let prevMonth =
    months[prevMonthIndex < 0 ? 11 : prevMonthIndex].toLowerCase();

  const transaction = await prisma.transaction.findFirst({
    where: {
      createdAt: {
        gte: startOfThisMonth,
        lt: startOfNextMonth,
      },
      salary: {
        recieverId: stuffId,
        inMonth: prevMonth as Month,
      },
    },
  });

  return transaction;
}

// export
export default {
  create,
  findById,
  findByType,
  findAllByQuery,
  findAllByRoleAndRoleId,
  findPrevMonthByStuffId,
};
