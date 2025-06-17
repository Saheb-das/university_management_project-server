// internal import
import { DegreeType } from "@prisma/client";
import { commissionConfig } from "../config/commission";

interface CommissionData {
  departmentType: string;
  degreeType: string;
  totalFee: number;
  commission: {
    stuff: number;
    recommender: number;
  };
}

interface ICommissionProps {
  departmentType: string;
  degreeType: DegreeType;
  role: keyof CommissionData["commission"];
}

export function calcCommission({
  degreeType,
  departmentType,
  role,
}: ICommissionProps): string {
  const comInc: CommissionData | undefined = commissionConfig.find((item) => {
    if (
      item.degreeType === degreeType &&
      item.departmentType === departmentType
    ) {
      return item;
    }
  });

  if (!comInc) {
    throw Error("commission data not found");
  }

  return `${(comInc.totalFee * comInc.commission[role]) / 100}`;
}
