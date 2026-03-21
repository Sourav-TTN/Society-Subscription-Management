"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";

import { axiosIns } from "@/lib/axios";
import { useAppSelector } from "@/store";
import { Loader } from "@/components/loader";
import { PageHeader } from "@/components/page-header";

import { UserBillsTable } from "./bills-list";
import { UserPaymentModal } from "./payment-modal";
import { UserPaymentSummary } from "./payment-summary";
import { PendingBillResultType, UserPaymentFormData } from "./types";

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

export const UserPaymentsClientPage = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] =
    useState<PendingBillResultType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBills, setPendingBills] = useState<PendingBillResultType[]>([]);

  const getAllPendingUserBills = async () => {
    if (!society?.societyId || !user?.userId) return;

    try {
      setLoading(true);
      const res = await axiosIns.get(
        `/api/society/${society.societyId}/bills/users/${user.userId}/pending`,
      );
      setPendingBills(res.data.bills);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to load pending bills",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPendingUserBills();
  }, [society?.societyId, user?.userId]);

  const handlePayClick = (bill: PendingBillResultType) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async (data: UserPaymentFormData) => {
    if (!society?.societyId || !user?.userId || !selectedBill) return;

    try {
      setIsSubmitting(true);
      const res = await axiosIns.post(
        `/api/society/${society.societyId}/payments`,
        {
          billId: data.billId,
          amount: data.amount,
          paymentVia: data.paymentVia,
        },
      );

      toast.success(res.data.message || "Payment initiated successfully");
      setIsModalOpen(false);
      setSelectedBill(null);

      getAllPendingUserBills();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!society?.societyId || !user?.userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Unable to load payment information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Make payments of your pending bills"
      />

      <UserPaymentSummary
        bills={pendingBills}
        userName={user.name}
        userFlat={pendingBills[0]?.flat}
      />

      <UserBillsTable
        bills={pendingBills}
        loading={loading}
        monthNames={monthNames}
        onPayClick={handlePayClick}
      />

      <UserPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        bill={selectedBill}
        monthNames={monthNames}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
