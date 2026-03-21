"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { axiosIns } from "@/lib/axios";
import { useAppSelector } from "@/store";
import { Skeleton } from "@/components/skeleton";

import { BillsSummary } from "./bills-summary";
import { BillsFilters } from "./bills-filters";
import { BillsList } from "./bills-list";
import { PaymentModal } from "./payment-modal";

export type UserBillResultType = {
  billId: string;
  flatRecipientId: string;
  name: string;
  flat: string;
  month: number;
  year: number;
  subscriptionId: string;
  charges: string;
  status: "pending" | "paid";
  createdAt: Date;
  updatedAt: Date;
  from: Date;
  to: Date | null;
  paidAt: Date | null;
  paymentMode: "cash" | "upi" | "online" | null;
  amount: number;
};

interface PaymentData {
  billId: string;
  paymentMode: "cash" | "upi" | "online";
  paidAt?: Date;
}

export const UserSubscriptionsClientPage = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  const [bills, setBills] = useState<UserBillResultType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<UserBillResultType | null>(
    null,
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Filter states
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString(),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    currentDate.getFullYear().toString(),
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getUserBills = async () => {
    if (!society?.societyId || !user?.userId) return;

    try {
      setLoading(true);
      const res = await axiosIns.get(
        `/api/society/${society.societyId}/bills/users/${user.userId}?month=${selectedMonth}&year=${selectedYear}`,
      );
      setBills(res.data.bills);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (data: PaymentData) => {
    if (!society?.societyId || !user?.userId) return;

    try {
      await axiosIns.patch(
        `/api/society/${society.societyId}/bills/${data.billId}`,
        {
          paymentMode: data.paymentMode,
          paidAt: data.paidAt,
          updatedBy: user.userId,
        },
      );

      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      getUserBills();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process payment");
      console.error(error);
    }
  };

  const handleOpenPaymentModal = (bill: UserBillResultType) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handleApplyFilters = () => {
    getUserBills();
  };

  const handleResetFilters = () => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
    setTimeout(() => getUserBills(), 0);
  };

  useEffect(() => {
    if (society?.societyId && user?.userId) {
      getUserBills();
    }
  }, [society?.societyId, user?.userId]);

  if (!society?.societyId || !user?.userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Unable to load your information
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please ensure you're logged in and associated with a society
          </p>
        </div>
      </div>
    );
  }

  if (loading && bills.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bills"
        description="View and pay your maintenance bills"
      />

      <BillsSummary bills={bills} />

      <BillsFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        monthNames={monthNames}
      />

      <BillsList
        bills={bills}
        onPayBill={handleOpenPaymentModal}
        monthNames={monthNames}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedBill(null);
        }}
        onSubmit={handlePayment}
        bill={selectedBill}
        monthNames={monthNames}
      />
    </div>
  );
};
