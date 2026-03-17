"use client";

import toast from "react-hot-toast";
import { axiosIns } from "@/lib/axios";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";

import { Loader } from "@/components/loader";
import { PaymentModal } from "./payment-modal";
import { PageHeader } from "@/components/page-header";
import { PendingBillsTable } from "./pending-bills-table";
import { PendingBillType, PaymentFormData } from "./types";

export const PaymentsClientPage = () => {
  const { admin } = useAppSelector((store) => store.adminReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBills, setPendingBills] = useState<PendingBillType[]>([]);

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

  const getAllPendingBills = async () => {
    if (!society?.societyId) return;

    try {
      setLoading(true);
      const res = await axiosIns.get(
        `/api/society/${society.societyId}/bills/pending`,
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
    getAllPendingBills();
  }, [society?.societyId]);

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!society?.societyId || !admin?.adminId) return;

    try {
      setIsSubmitting(true);
      const res = await axiosIns.post(
        `/api/society/${society.societyId}/payments`,
        {
          billId: data.billId,
          amount: data.amount,
          paymentVia: data.paymentVia,
          paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
          recordedBy: admin.adminId,
        },
      );

      toast.success(res.data.message || "Payment recorded successfully");
      setIsModalOpen(false);
      getAllPendingBills();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!society?.societyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No society selected</p>
      </div>
    );
  }

  if (loading && pendingBills.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Entries"
        description="Manage payment charges for offline payments"
        actionLabel="Record New Payment"
        onAction={() => setIsModalOpen(true)}
      />

      <PendingBillsTable
        bills={pendingBills}
        loading={loading}
        monthNames={monthNames}
      />

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        bills={pendingBills}
        monthNames={monthNames}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
