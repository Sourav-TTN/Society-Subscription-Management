"use client";

import toast from "react-hot-toast";
import { axiosIns } from "@/lib/axios";
import { Calendar } from "lucide-react";
import { useAppSelector } from "@/store";

import { useEffect, useState } from "react";

import { BillsTable } from "./bills-table";
import { UpdateBillModal } from "./bill-modal";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { Dropdown } from "@/components/dropdown";
import { PageHeader } from "@/components/page-header";

export type ApiBillResponseType = {
  billId: string;
  name: string;
  flat: string;
  month: number;
  year: number;
  charges: string;
  subscriptionId: string;
  flatRecipientId: string;
  status: "pending" | "paid";
  paymentMode?: "cash" | "upi" | "online";
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

interface UpdateBillData {
  billId: string;
  paymentMode: "cash" | "upi" | "online";
  paidAt?: Date;
}

export const MonthlyRecordsClient = () => {
  const { society } = useAppSelector((store) => store.societyReducer);
  const { admin } = useAppSelector((store) => store.adminReducer);

  const [bills, setBills] = useState<ApiBillResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<ApiBillResponseType | null>(
    null,
  );

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

  const monthOptions = monthNames.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
    icon: <Calendar className="h-4 w-4" />,
  }));

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push({
        value: i.toString(),
        label: i.toString(),
        icon: <Calendar className="h-4 w-4" />,
      });
    }
    return years;
  };

  const getAllBills = async () => {
    if (!society?.societyId) return;

    try {
      setLoading(true);
      const response = await axiosIns.get(
        `/api/society/${society.societyId}/bills?month=${selectedMonth}&year=${selectedYear}`,
      );
      setBills(response.data.bills);
    } catch (error: any) {
      toast.error("Failed to load bills");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBill = async (data: UpdateBillData) => {
    if (!society?.societyId || !admin?.adminId) return;

    try {
      const res = await axiosIns.patch(
        `/api/society/${society.societyId}/bills/${data.billId}`,
        {
          paymentMode: data.paymentMode,
          paidAt: data.paidAt,
          updatedBy: admin.adminId,
        },
      );

      toast.success("Payment recorded successfully");
      setIsUpdateModalOpen(false);
      setSelectedBill(null);
      getAllBills();
    } catch (error: any) {
      toast.error("Failed to update bill");
      console.error(error);
    }
  };

  const handleOpenUpdateModal = (bill: ApiBillResponseType) => {
    setSelectedBill(bill);
    setIsUpdateModalOpen(true);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  const handleApplyFilters = () => {
    getAllBills();
  };

  const handleResetFilters = () => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
  };

  useEffect(() => {
    if (society?.societyId) {
      getAllBills();
    }
  }, [society?.societyId]);

  if (!society?.societyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No society selected</p>
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
        title="Monthly Records"
        description="View and manage monthly maintenance bills for all flats."
      />

      <div className="bg-card border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Month
              </label>
              <Dropdown
                options={monthOptions}
                value={selectedMonth}
                onChange={handleMonthChange}
                placeholder="Select month"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Year
              </label>
              <Dropdown
                options={yearOptions()}
                value={selectedYear}
                onChange={handleYearChange}
                placeholder="Select year"
              />
            </div>
          </div>

          <div className="flex gap-2 sm:ml-auto">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="whitespace-nowrap"
            >
              Reset to Current
            </Button>
            <Button onClick={handleApplyFilters} className="whitespace-nowrap">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      <BillsTable
        bills={bills}
        onUpdateStatus={handleOpenUpdateModal}
        monthNames={monthNames}
      />

      <UpdateBillModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedBill(null);
        }}
        onSubmit={handleUpdateBill}
        bill={selectedBill}
        monthNames={monthNames}
      />
    </div>
  );
};
