export interface ResidentDashboardOverview {
  totalPaid: number;
  totalPending: number;
  totalOutstanding: number;
  pendingBillsCount: number;
  paidBillsCount: number;
  paymentComplianceRate: number;
}

export interface MonthlyTrend {
  month: string;
  pendingAmount: number;
  paidAmount: number;
  totalBilled: number;
  paymentRate: number;
}

export interface OutstandingBill {
  id: string;
  month: string;
  year: number;
  amount: number;
  flatAddress: string;
}

export interface RecentPayment {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  period: string;
}

export interface PaymentMethod {
  method: string;
  amount: number;
  percentage?: number;
}

export interface Flat {
  id: string;
  size: string;
  address: string;
}

export interface ResidentDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  flats: Flat[];
  overview: ResidentDashboardOverview;
  monthlyTrends: MonthlyTrend[];
  outstandingBills: OutstandingBill[];
  recentPayments: RecentPayment[];
  paymentMethods: PaymentMethod[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
  message?: string;
}
