// internal import
import transactionService from "../service/transaction";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { CustomError } from "../lib/error";
import {
  transactionSchema,
  TTransactionClient,
  TVerifyOrderClient,
  verifyOrderSchema,
} from "../zod/transaction";

async function createTransaction(
  req: AuthRequest<TTransactionClient, {}, { stuff: string; student: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const transactionInfo = req.body;
  const { student, stuff } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unathorized user", 401);
    }

    if (!student && !stuff) {
      throw new CustomError("user id required in query params", 400);
    }

    const collageId = req.authUser.collageId;

    const isValid = transactionSchema.safeParse(transactionInfo);
    if (!isValid.success) {
      throw new CustomError(isValid.error.message, 400);
    }

    const newTransaction = await transactionService.createTransaction(
      isValid.data,
      collageId,
      stuff,
      student
    );
    if (!newTransaction) {
      throw new CustomError("transaction not create", 500);
    }

    res.status(200).json({
      success: true,
      message: "transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    next(error);
  }
}

async function getTransactions(
  req: AuthRequest<{}, {}, { payType: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { payType } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const transactions = await transactionService.getAllTransactions(payType);
    if (!transactions) {
      throw new CustomError("transactions not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "transactions fetched successfully",
      transactions: transactions,
    });
  } catch (error) {
    next(error);
  }
}

async function getTransaction(
  req: AuthRequest<{}, { id: string }, { payType: string }>,
  res: Response,
  next: NextFunction
) {
  const { payType } = req.query;
  const { id } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!id) {
      throw new CustomError("transaction id required", 400);
    }

    const transaction = await transactionService.getTransaction(id, payType);
    if (!transaction) {
      throw new CustomError("transaction not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "transaction fetched successfully",
      transaction: transaction,
    });
  } catch (error) {
    next(error);
  }
}

async function updateTransaction() {}
async function deleteTransaction() {}

async function createPaymentOrder(
  req: AuthRequest<{ amount: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { amount } = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const userInfo = {
      collage: req.authUser.collageId,
      userId: req.authUser.id,
      userRole: req.authUser.role,
    };

    if (!amount) {
      throw new CustomError("payment amount required", 400);
    }

    const newOrder = await transactionService.createPaymentOrder(
      amount,
      userInfo
    );
    if (!newOrder) {
      throw new CustomError("order not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "payment order created successfully",
      order: newOrder,
    });
  } catch (error) {
    next(error);
  }
}

interface IVerifyOrder {
  transaction: TTransactionClient;
  verifiedInfo: TVerifyOrderClient;
}

async function verifyPaymentOrder(
  req: AuthRequest<IVerifyOrder, {}, { student: string; stuff: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { transaction, verifiedInfo } = req.body;
  const { student, stuff } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!student && !stuff) {
      throw new CustomError("user id required in query params", 400);
    }

    const collageId = req.authUser.collageId;

    const isValidTrans = transactionSchema.safeParse(transaction);
    if (!isValidTrans.success) {
      throw new CustomError(
        "invalid transaction input",
        400,
        isValidTrans.error
      );
    }

    const isValidVerify = verifyOrderSchema.safeParse(verifiedInfo);
    if (!isValidVerify.success) {
      throw new CustomError("invalid verify input", 400, isValidVerify.error);
    }

    const newTransaction = await transactionService.verifyPaymentOrderAndCreate(
      isValidVerify.data,
      isValidTrans.data,
      collageId,
      stuff,
      student
    );
    if (!newTransaction) {
      throw new CustomError("transaction not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "payment order created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  createPaymentOrder,
  verifyPaymentOrder,
};
