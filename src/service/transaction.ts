// external import
import crypto from "crypto";

// internal import
import transactionRepository from "../repository/transaction";
import salaryRepository from "../repository/salary";
import tutionFeeRepository from "../repository/tutionFee";
import collageRepository from "../repository/collage";
import stuffRepository from "../repository/stuff";
import studentRepository from "../repository/student";
import razorpayRepository from "../repository/razorpay";
import { razorpay } from "../razorpay/index";
import { CustomError } from "../lib/error";

// types import
import { Salary, Transaction, TutionFee, UserRole } from "@prisma/client";
import {
  TSalaryClient,
  TTransactionClient,
  TTransWithVerify,
  TTutionFeeClient,
  TVerifyOrderClient,
} from "../zod/transaction";
import { ISalary, ITransaction, ITutionFee } from "../types/transaction";
import { Orders } from "razorpay/dist/types/orders";
import { TRole } from "../types";

async function createTransaction(
  transInfo: TTransactionClient,
  collageId: string,
  stuffId: string = "",
  studentId: string
): Promise<Transaction | null> {
  try {
    if (transInfo.mode === "inapp") {
      throw new CustomError("transaction mode should not be in-app");
    }
    const transPayload: ITransaction = {
      amount: transInfo.amount,
      date: transInfo.date,
      mode: transInfo.mode,
      time: transInfo.time,
      type: transInfo.type,
      userRole: transInfo.userRole as UserRole,
      utr: transInfo.utr,
      currency: "INR",
    };

    const newTrans = await transactionRepository.create(transPayload);
    if (!newTrans) {
      throw new CustomError("transaction not created", 500);
    }

    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    if (transInfo.salary) {
      const newSalary = await createSalaryTrans(
        stuffId,
        transInfo.salary,
        collage.id,
        newTrans.id
      );
      if (!newSalary) {
        throw new CustomError("salary not created", 500);
      }
    }

    if (transInfo.tutionFee) {
      const newTutionFee = await createTutionTrans(
        studentId,
        transInfo.tutionFee,
        collage.id,
        newTrans.id
      );
      if (!newTutionFee) {
        throw new CustomError("tution not created", 500);
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

type UserInfo = {
  collage: string;
  userId: string;
  userRole: TRole;
};
async function createPaymentOrder(
  amount: string,
  user: UserInfo
): Promise<Orders.RazorpayOrder | null> {
  try {
    if (!amount) {
      throw new CustomError("amount required", 400);
    }

    // order option
    const option = {
      amount: amount,
      currency: "INR",
      receipt: `${user.userRole}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(option);
    if (!order) {
      throw new CustomError("order not created", 500);
    }

    return order;
  } catch (error) {
    console.log("Error create order", error);
    return null;
  }
}

async function verifyPaymentOrderAndCreate(
  verifyInfo: TVerifyOrderClient,
  transInfo: TTransWithVerify,
  collageId: string,
  stuffId: string = "",
  studentId: string
): Promise<Transaction | null> {
  try {
    if (!verifyInfo) {
      throw new CustomError("verify info required", 400);
    }

    const isVerified = await verifyPaymentOrder(verifyInfo);
    if (!isVerified) {
      throw new CustomError("signature does not match", 500);
    }

    if (transInfo.mode !== "inapp") {
      throw new CustomError("transaction mode must be in-app mode", 400);
    }

    const transactionPayload: ITransaction = {
      amount: verifyInfo.amount,
      date: transInfo.date,
      mode: "in_app",
      time: transInfo.time,
      type: transInfo.type,
      userRole: transInfo.userRole,
      utr: verifyInfo.razorpay_payment_id,
      currency: verifyInfo.currency,
    };
    const newTrans = await transactionRepository.create(transactionPayload);
    if (!newTrans) {
      throw new CustomError("transaction not created", 500);
    }

    const collageBank = await collageRepository.findById(collageId);
    if (!collageBank) {
      throw new CustomError("collage not found", 404);
    }

    const newRazorpayTrans = await razorpayRepository.create(
      verifyInfo,
      newTrans.id
    );
    if (!newRazorpayTrans) {
      throw new CustomError("razorpay transaction not created", 500);
    }

    if (transInfo.salary) {
      const newSalary = await createSalaryTrans(
        stuffId,
        transInfo.salary,
        collageBank.bankAccountId,
        newTrans.id
      );
      if (!newSalary) {
        throw new CustomError("salary not created", 500);
      }
    }

    if (transInfo.tutionFee) {
      const newTutionFee = await createTutionTrans(
        studentId,
        transInfo.tutionFee,
        collageBank.bankAccountId,
        newTrans.id
      );
      if (!newTutionFee) {
        throw new CustomError("tution not created", 500);
      }
    }

    return newTrans;
  } catch (error) {
    console.log("Error creating transaction", error);
    return null;
  }
}

async function verifyPaymentOrder(
  verifyInfo: TVerifyOrderClient
): Promise<Boolean> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    verifyInfo;

  const razorpaySecret = process.env.RAZORPAY_SECRET;
  if (!razorpaySecret) {
    throw new CustomError(
      "RAZORPAY_SECRET environment variable is not set",
      500
    );
  }

  const hmac = crypto.createHmac("sha256", razorpaySecret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return false;
  }

  return true;
}

async function createTutionTrans(
  studentId: string,
  feeInfo: TTutionFeeClient,
  collageId: string,
  transId: string
): Promise<TutionFee | null> {
  if (!studentId) {
    throw new CustomError("student id required", 400);
  }

  const isValidStudent = await studentRepository.findById(studentId);
  if (!isValidStudent) {
    throw new CustomError("student not found", 404);
  }

  const tutionFeePayload: ITutionFee = {
    semNo: Number(feeInfo.semFees),
    semFees: feeInfo.semFees,
    lateFine: feeInfo.lateFine || "0.00",
    totalAmount: feeInfo.totalAmount,
    isVerified: false,
    senderId: studentId,
    recieverId: collageId,
    transactionId: transId,
  };
  const newTutionFee = await tutionFeeRepository.create(tutionFeePayload);
  if (!newTutionFee) {
    throw new CustomError("tution fee not created", 500);
  }

  return newTutionFee;
}

async function createSalaryTrans(
  stuffId: string,
  salaryInfo: TSalaryClient,
  collageId: string,
  transId: string
): Promise<Salary | null> {
  if (!stuffId) {
    throw new CustomError("stuff id required", 400);
  }

  const isValidStuff = await stuffRepository.findById(stuffId);
  if (!isValidStuff) {
    throw new CustomError("stuff not found", 404);
  }

  const salaryPayload: ISalary = {
    inMonth: salaryInfo.inMonth,
    performanceBonus: salaryInfo.performanceBonus || "0.00",
    salaryAmount: salaryInfo.salaryAmount,
    totalAmount: salaryInfo.totalAmount,
    recieverId: stuffId,
    senderId: collageId,
    transactionId: transId,
  };
  const newSalary = await salaryRepository.create(salaryPayload);
  if (!newSalary) {
    throw new CustomError("salary not created", 500);
  }

  return newSalary;
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
  createPaymentOrder,
  verifyPaymentOrderAndCreate,
  getAllTransactionsByRoleAndUserId,
};
