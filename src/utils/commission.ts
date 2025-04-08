// internal import
import { DegreeType } from "@prisma/client";
import { commissionConfig } from "../config/commission";

interface CommissionData {
  courseName: string;
  departmentType: string;
  degreeType: string;
  totalFee: number;
  commission: {
    stuff: number;
    recommender: number;
  };
}

interface ICommissionProps {
  courseName: string;
  departmentType: string;
  degreeType: DegreeType;
  role: keyof CommissionData["commission"];
}

export function calcCommission({
  courseName,
  degreeType,
  departmentType,
  role,
}: ICommissionProps): string {
  const comInc: CommissionData | undefined = commissionConfig.find((item) => {
    if (
      item.courseName === courseName &&
      item.degreeType === degreeType &&
      item.departmentType === departmentType
    ) {
      return item;
    }
  });

  if (!comInc) {
    throw Error("commission data not found");
  }

  return `${(comInc.totalFee * comInc.commission.stuff) / 100}`;
}
