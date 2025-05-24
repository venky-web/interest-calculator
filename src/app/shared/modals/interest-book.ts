export interface IBookRecord {
  id: number;
  type: string; // lender name or borrower name
  name: string;
  interestType: string; // rupees or percentage
  interestRate: number;
  principalAmount: number;
  calculationType: string; // simple or compound
  // Additional fields
  mobileNumber?: string;
  compoundFrequency?: string; // yearly, half-yearly, quarterly or monthly
  notes?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  duration?: string;
  interestAmount?: number;
  totalDue?: number;
  years?: number;
  months?: number;
  days?: number;
}

export interface ISavedRecord extends IBookRecord {
  tenureType: string;
}

export interface IBookSummary {
  netAmount: number;
  totalLent: number;
  totalLentInterest: number;
  totalLentItems: number;
  totalBorrowed: number;
  totalBorrowedInterest: number;
  totalBorrowedItems: number;
}
