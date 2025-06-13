import crypto from "crypto";
import { Orders } from "razorpay/dist/types/orders";
import { CustomError } from "../lib/error";
import { razorpay } from "../razorpay";
import { TRole } from "../types";

type UserInfo = {
  collage: string;
  userId: string;
  userRole: TRole;
};
async function createPayOrder(
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

export interface IVerifyOrder {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
async function verifyPayOrder(verifyInfo: IVerifyOrder): Promise<Boolean> {
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

// export
export default {
  createPayOrder,
  verifyPayOrder,
};
