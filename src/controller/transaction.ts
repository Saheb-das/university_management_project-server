// internal import
import transactionService from "../service/transaction";

import { CustomError } from "../lib/error";
import { transactionSchema } from "../zod/transaction";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { TTransactionClient } from "../zod/transaction";

interface ICreateTransBody {
  transData: TTransactionClient;
  isSalary: boolean;
  userId: string;
}

async function createTransaction(
  req: AuthRequest<ICreateTransBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { transData, isSalary, userId } = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unathorized user", 401);
    }

    if (!userId) {
      throw new CustomError("user id required", 400);
    }

    const collageId = req.authUser.collageId;

    const isValid = transactionSchema.safeParse(transData);
    if (!isValid.success) {
      throw new CustomError(isValid.error.message, 400, isValid.error);
    }

    const newTransaction = await transactionService.createTransaction({
      transInfo: isValid.data,
      collageId,
      isSalary,
      userId,
    });
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

async function getMyTransactions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const trans = await transactionService.getAllTransactionsByRoleAndUserId(
      req.authUser.role,
      req.authUser.id
    );
    if (!trans) {
      throw new CustomError("transactions not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "transactions fetched successfully",
      transactions: trans,
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
  getMyTransactions,
};
