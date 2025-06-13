import { z } from "zod";

export const verifyOrderSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
export type TVerifyOrderClient = z.infer<typeof verifyOrderSchema>;
