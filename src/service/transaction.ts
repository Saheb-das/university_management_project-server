// internal import
import transactionRepository from "../repository/transaction";
import salaryRepository from "../repository/salary";
import tutionFeeRepository from "../repository/tutionFee";
import collageRepository from "../repository/collage";

// types import
import { Transaction } from "@prisma/client";
import { TTransactionClient } from "../zod/transaction";
import { ISalary, ITransaction, ITutionFee } from "../types/transaction";
import { CustomError } from "../lib/error";

async function createTransaction(
  transInfo: TTransactionClient,
  collageId: string,
  stuffId: string = "",
  studentId: string
): Promise<Transaction | null> {
  try {
    const transPayload: ITransaction = {
      amount: transInfo.amount,
      date: transInfo.date,
      mode: transInfo.mode,
      time: transInfo.time,
      type: transInfo.type,
      userRole: transInfo.userRole,
      utr: transInfo.utr,
    };
    const newTrans = await transactionRepository.create(transPayload);
    if (!newTrans) {
      throw new CustomError("transaction not created", 500);
    }

    const collageBank = await collageRepository.findById(collageId);
    if (!collageBank) {
      throw new CustomError("collage not found", 404);
    }

    if (transInfo.salary) {
      if (!stuffId) {
        throw new CustomError("stuff id required", 400);
      }

      const salaryPayload: ISalary = {
        inMonth: transInfo.salary.inMonth,
        performanceBonus: transInfo.salary.performanceBonus || "0.00",
        salaryAmount: transInfo.salary.salaryAmount,
        totalAmount: transInfo.salary.totalAmount,
        recieverId: stuffId,
        senderId: collageBank.bankAccountId,
        transactionId: newTrans.id,
      };
      const newSalary = await salaryRepository.create(salaryPayload);
      if (!newSalary) {
        throw new CustomError("salary not created", 500);
      }
    }

    if (transInfo.tutionFee) {
      if (!studentId) {
        throw new CustomError("student id required", 400);
      }

      const tutionFeePayload: ITutionFee = {
        semNo: Number(transInfo.tutionFee.semFees),
        semFees: transInfo.tutionFee.semFees,
        lateFine: transInfo.tutionFee.lateFine || "0.00",
        totalAmount: transInfo.tutionFee.totalAmount,
        isVerified: false,
        senderId: studentId,
        recieverId: collageBank.bankAccountId,
        transactionId: newTrans.id,
      };
      const newTutionFee = await tutionFeeRepository.create(tutionFeePayload);
      if (!newTutionFee) {
        throw new CustomError("tution fee not created", 500);
      }
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

// export
export default {
  createTransaction,
  getAllTransactions,
  getTransaction,
};
