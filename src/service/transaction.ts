// internal import
import transactionRepository from "../repository/transaction";
import stuffRepository from "../repository/stuff";
import studentRepository from "../repository/student";
import { CustomError } from "../lib/error";
import { monthArr } from "../config/constant";

// types import
import { Transaction, UserRole } from "@prisma/client";
import { TTransactionClient } from "../zod/transaction";
import { ITransaction } from "../types/transaction";
import { IVerifyOrder } from "./razorpay";

interface CreateProps {
  transInfo: TTransactionClient;
  collageId: string;
  isSalary: boolean;
  userId: string;
}

async function createTransaction({
  transInfo,
  collageId,
  isSalary,
  userId,
}: CreateProps): Promise<Transaction | null> {
  try {
    const { trans, razor, salary, tutionFee } = transInfo;

    if (trans.mode === "in-app") {
      throw new CustomError("transaction mode should not be in-app");
    }

    let studentId = "";
    let stuffId = "";

    if (!isSalary) {
      const student = await studentRepository.findByUserId(userId);
      if (!student) {
        throw new CustomError("student user not found", 404);
      }

      studentId = student.id;
    } else {
      const stuff = await stuffRepository.findByUserId(userId);
      if (!stuff) {
        throw new CustomError("stuff user not found", 404);
      }

      stuffId = stuff.id;
    }

    const transPayload: ITransaction = {
      amount: trans.amount,
      date: trans.date,
      mode: trans.mode === "inapp" ? "in_app" : trans.mode,
      time: trans.time,
      type: trans.type,
      userRole: trans.userRole as UserRole,
      utr: trans.utr,
      currency: "INR",
    };

    const razorTrans: IVerifyOrder = {
      razorpay_order_id: razor.razorpay_order_id,
      razorpay_payment_id: razor.razorpay_payment_id,
      razorpay_signature: razor.razorpay_signature,
    };

    let salaryPayload: any = {};
    let feePayload: any = {};

    if (isSalary) {
      if (salary) {
        salaryPayload = {
          inMonth: monthArr[new Date().getMonth()],
          performanceBonus: salary.performanceBonus || "0",
          salaryAmount: salary.salaryAmount,
          totalAmount: salary.totalAmount,
          recieverId: stuffId,
          senderId: collageId,
        };
      }
    } else {
      if (tutionFee) {
        feePayload = {
          semNo: tutionFee.semNo,
          lateFine: tutionFee.lateFine || "0",
          semFees: tutionFee.semFees,
          totalAmount: tutionFee.totalAmount,
          isVerified: false,
          senderId: studentId,
          recieverId: collageId,
        };
      }
    }

    const newTrans = await transactionRepository.create({
      isSalary: isSalary,
      orderInfo: razorTrans,
      transInfo: transPayload,
      salaryInfo: salaryPayload,
      feesInfo: feePayload,
    });
    if (!newTrans) {
      throw new CustomError("transaction not created", 500);
    }

    return newTrans;
  } catch (error) {
    console.log("Error create transaction", error);
    return null;
  }
}

async function getAllTransactions(
  payType: string
): Promise<Transaction[] | null> {
  try {
    const salaryType = payType === "salary";
    const tutionFeeType = payType === "tutionFee";

    const transactions = await transactionRepository.findAll(
      salaryType,
      tutionFeeType
    );

    return transactions;
  } catch (error) {
    console.log("Error fetching transactions", error);
    return null;
  }
}

async function getTransaction(
  transactionId: string,
  payType: string
): Promise<Transaction | null> {
  try {
    const sType = payType === "salary";
    const tType = payType === "tutionFee";

    const transaction = await transactionRepository.findById(
      transactionId,
      sType,
      tType
    );

    return transaction;
  } catch (error) {
    console.log("Error fetching transaction", error);
    return null;
  }
}

async function getAllTransactionsByRoleAndUserId(
  role: UserRole,
  userId: string
): Promise<Transaction[] | null> {
  try {
    let roledUser: any;
    if (role === "student") {
      roledUser = await studentRepository.findByUserId(userId);
      if (!roledUser) {
        throw new CustomError("student user not found", 404);
      }
    } else {
      roledUser = await stuffRepository.findByUserId(userId);
      if (!roledUser) {
        throw new CustomError(`${role} user not found`, 404);
      }
    }

    const trans = await transactionRepository.findAllByRoleAndRoleId(
      roledUser.id,
      role
    );
    if (!trans) {
      throw new CustomError("transactions not found", 404);
    }

    return trans;
  } catch (error) {
    console.log("Error finding transactions", error);
    return null;
  }
}

// export
export default {
  createTransaction,
  getAllTransactions,
  getTransaction,

  getAllTransactionsByRoleAndUserId,
};
