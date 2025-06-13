export interface ISalary {
  inMonth: string;
  salaryAmount: string;
  totalAmount: string;
  performanceBonus: string;
  senderId: string;
  recieverId: string;
  transactionId: string;
}

export interface ITutionFee {
  totalAmount: string;
  semNo: number;
  semFees: string;
  lateFine: string;
  isVerified: boolean;
  senderId: string;
  recieverId: string;
  transactionId: string;
}

export interface ITransaction {
  type: string;
  userRole: string;
  amount: string;
  date: string;
  time: string;
  mode: string;
  utr: string;
  currency: string;
}

export interface IVerifyOrder {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
