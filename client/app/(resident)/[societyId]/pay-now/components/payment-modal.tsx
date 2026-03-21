"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IndianRupee, CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";

import {
  PendingBillResultType,
  UserPaymentFormData,
  userPaymentSchema,
} from "./types";

interface UserPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserPaymentFormData) => Promise<void>;
  bill: PendingBillResultType | null;
  monthNames: string[];
  isSubmitting?: boolean;
}

const paymentMethodOptions = [
  { value: "cash", label: "Cash", icon: <IndianRupee className="h-4 w-4" /> },
  { value: "upi", label: "UPI", icon: <CreditCard className="h-4 w-4" /> },
  { value: "card", label: "Card", icon: <CreditCard className="h-4 w-4" /> },
];

export const UserPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  bill,
  monthNames,
  isSubmitting = false,
}: UserPaymentModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserPaymentFormData>({
    resolver: zodResolver(userPaymentSchema),
  });

  const selectedPaymentVia = watch("paymentVia");

  // Reset form when modal opens/closes or bill changes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  // Set form values when bill changes
  if (bill && bill.billId !== watch("billId")) {
    setValue("billId", bill.billId);
    setValue("amount", bill.charges);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>Pay your pending bill securely</DialogDescription>
        </DialogHeader>

        {bill && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bill Details Summary */}
            <div className="bg-muted/40 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Bill Details</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Period:</span>
                <span>
                  {monthNames[bill.month - 1]} {bill.year}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Flat:</span>
                <span>{bill.flat}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Amount:</span>
                <span className="text-lg">₹{bill.charges}</span>
              </div>
            </div>

            {/* Hidden inputs for billId */}
            <input type="hidden" {...register("billId")} />

            {/* Amount Field (Read-only) */}
            <Input
              label="Amount"
              type="number"
              step="0.01"
              icon={<IndianRupee className="h-4 w-4" />}
              error={errors.amount?.message}
              {...register("amount")}
              readOnly
              className="bg-muted"
            />

            {/* Payment Method Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Payment Method <span className="text-destructive">*</span>
              </label>
              <Dropdown
                options={paymentMethodOptions}
                value={selectedPaymentVia}
                onChange={(value) =>
                  setValue("paymentVia", value as "cash" | "upi" | "card")
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

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₹{bill.charges}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
