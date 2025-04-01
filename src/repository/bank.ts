// internal import
import prisma from "../lib/prisma";

// types import
import { IBank } from "../types";

async function create(payload: IBank) {
  const newBank = await prisma.bankAccount.create({
    data: {
      bankName: payload.bankName,
      ifscCode: payload.ifscCode,
      accountNo: payload.accountNo,
      accountHolderName: payload.accountHolderName,
    },
  });

  return newBank;
}

// export
export default {
  create,
};
