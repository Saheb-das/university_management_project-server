// internal import
import prisma from "../lib/prisma";

// types import
import { Month, Salary } from "@prisma/client";
import { ISalary } from "../types/transaction";

async function create(salary: ISalary): Promise<Salary | null> {
  const newSalary = await prisma.salary.create({
    data: {
      inMonth: salary.inMonth as Month,
      performanceBonus: salary.performanceBonus,
      salaryAmount: salary.salaryAmount,
      totalAmount: salary.totalAmount,
      senderId: salary.senderId,
      recieverId: salary.recieverId,
      transactionId: salary.transactionId,
    },
  });

  return newSalary;
}

async function findAll(
  includeTrans: boolean = false
): Promise<Salary[] | null> {
  const salaries = await prisma.salary.findMany({
    include: {
      transaction: includeTrans,
    },
  });

  return salaries;
}

// export
export default {
  create,
  findAll,
};
