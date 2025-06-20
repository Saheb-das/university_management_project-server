// external import
import prisma from "../lib/prisma";

// types import
import { RazorpayTransaction } from "@prisma/client";
import { TVerifyOrderClient } from "../zod/razorpay";

async function create(
  payload: TVerifyOrderClient,
  tranId: string
): Promise<RazorpayTransaction | null> {
  const newRazorTrans = await prisma.razorpayTransaction.create({
    data: {
      razorpayOrderId: payload.razorpay_order_id,
      razorpayPaymentId: payload.razorpay_payment_id,
      razorpaySignature: payload.razorpay_signature,
      transactionId: tranId,
    },
  });

  return newRazorTrans;
}

// export
export default {
  create,
};
