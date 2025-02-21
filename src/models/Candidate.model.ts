export interface Candidate {
  id?: number;
  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;
}
