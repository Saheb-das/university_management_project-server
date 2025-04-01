interface ICollage {
  name: string;
  address: string;
  registrationNo: string;
  established: string;
  programs: string[] | [];
  bankAccountId: string;
}

interface ICollageUpdate {
  approvedBy: string;
  ranking: string;
  campusSize: string;
  programs: string[];
}

export { ICollage, ICollageUpdate };
