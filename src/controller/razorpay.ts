import razorpayService from "../service/razorpay";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { CustomError } from "../lib/error";
import { TVerifyOrderClient, verifyOrderSchema } from "../zod/razorpay";

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

    const newOrder = await razorpayService.createPayOrder(amount, userInfo);
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

async function verifyPaymentOrder(
  req: AuthRequest<TVerifyOrderClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isVerify = verifyOrderSchema.safeParse(req.body);
    if (!isVerify.success) {
      throw new CustomError("invalid input", 400, isVerify.error);
    }

    const isVerified = await razorpayService.verifyPayOrder(isVerify.data);

    res.status(200).json({
      success: true,
      message: "order verified successfully",
      isVerified: isVerified,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createPaymentOrder,
  verifyPaymentOrder,
};
