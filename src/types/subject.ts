interface ISubject {
  name: string;
  code: string;
  credit: number;
}

export interface ISubjects {
  [key: string]: ISubject[];
}
