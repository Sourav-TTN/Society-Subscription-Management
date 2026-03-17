"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Calendar, IndianRupee, CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";

import { BillSearchResults } from "./bill-search-results";
import { SelectedBillDisplay } from "./selected-bill-display";
import { PendingBillType, PaymentFormData, paymentSchema } from "./types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  bills: PendingBillType[];
  monthNames: string[];
  isSubmitting?: boolean;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  bills,
  monthNames,
  isSubmitting = false,
}: PaymentModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paidAt: new Date().toISOString().split("T")[0],
    },
  });

  const selectedBillId = watch("billId");
  const selectedPaymentVia = watch("paymentVia");
  const selectedBill = bills.find((bill) => bill.billId === selectedBillId);

  const filteredBills =
    searchQuery.trim() === ""
      ? []
      : bills.filter(
          (bill) =>
            bill.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.flat.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  useEffect(() => {
    if (selectedBill) {
      setValue("amount", selectedBill.charges);
    }
  }, [selectedBill, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setIsSearching(false);
      reset();
    }
  }, [isOpen, reset]);

  const paymentMethodOptions = [
    { value: "cash", label: "Cash", icon: <IndianRupee className="h-4 w-4" /> },
    { value: "upi", label: "UPI", icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Record New Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Search Bill <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by owner name, email, or flat number..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearching(true);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            {searchQuery && (
              <BillSearchResults
                bills={filteredBills}
                onSelect={(billId: string) => {
                  setValue("billId", billId);
                  setSearchQuery("");
                  setIsSearching(false);
                }}
                monthNames={monthNames}
              />
            )}

            {selectedBill && !isSearching && (
              <SelectedBillDisplay
                bill={selectedBill}
                monthNames={monthNames}
              />
            )}

            {errors.billId && !selectedBill && (
              <p className="text-xs text-destructive">
                {errors.billId.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              icon={<IndianRupee className="h-4 w-4" />}
              error={errors.amount?.message}
              {...register("amount")}
              readOnly={!!selectedBill}
              className={selectedBill ? "bg-muted" : ""}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Payment Method <span className="text-destructive">*</span>
              </label>
              <Dropdown
                options={paymentMethodOptions}
                value={selectedPaymentVia}
                onChange={(value) =>
                  setValue("paymentVia", value as "cash" | "upi")
                }
                placeholder="Select payment method"
                className={errors.paymentVia ? "border-destructive" : ""}
              />
              {errors.paymentVia && (
                <p className="text-xs text-destructive">
                  {errors.paymentVia.message}
                </p>
              )}
            </div>

            <Input
              label="Payment Date (optional)"
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              error={errors.paidAt?.message}
              {...register("paidAt")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
