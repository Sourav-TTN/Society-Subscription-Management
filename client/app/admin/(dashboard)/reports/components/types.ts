export type BillReportType = {
  billId: string;
  flatRecipientId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "paid";
  subscriptionId: string;
  month: number;
  year: number;
  flat: string;
  flatId: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  isCurrentOwner: boolean;
  from: Date;
  amount: number;
  paymentId: string | null;
  paymentVia: "cash" | "upi" | "online" | null;
};

export type ReportsApiResponseType = {
  message: string;
  bills: BillReportType[];
  totalPending: number;
  totalCollected: number;
  pendingCustomers: number;
  totalCashPayments: number;
  totalUpiPayments: number;
  pendingPayments: BillReportType[];
  totalOnlinePayments: number;
  success: boolean;
};
