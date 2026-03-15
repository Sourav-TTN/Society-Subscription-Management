"use client";

import z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Calendar, IndianRupee, Home, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { ApiBillResponseType } from "./page-client";

const updateBillSchema = z.object({
  paymentMode: z.enum(["cash", "upi", "online"], {
    error: "Please select a payment mode",
  }),
  paidAt: z.string().optional(),
});

type UpdateBillFormData = z.infer<typeof updateBillSchema>;

interface UpdateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    billId: string;
    paymentMode: "cash" | "upi" | "online";
    paidAt?: Date;
  }) => Promise<void>;
  bill: ApiBillResponseType | null;
  monthNames: string[];
}

export const UpdateBillModal = ({
  isOpen,
  onClose,
  onSubmit,
  bill,
  monthNames,
}: UpdateBillModalProps) => {
  const {
    reset,
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBillFormData>({
    resolver: zodResolver(updateBillSchema),
    defaultValues: {
      paymentMode: undefined,
      paidAt: new Date().toLocaleDateString(),
    },
  });

  const selectedPaymentMode = watch("paymentMode");

  useEffect(() => {
    if (bill) {
      reset({
        paymentMode: undefined,
        paidAt: new Date().toLocaleDateString(),
      });
    }
  }, [bill, reset]);

  const handleFormSubmit = async (data: UpdateBillFormData) => {
    if (!bill) return;

    await onSubmit({
      billId: bill.billId,
      paymentMode: data.paymentMode,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
    });
  };

  const paymentModeOptions = [
    { value: "cash", label: "Cash", icon: <IndianRupee className="h-4 w-4" /> },
    { value: "upi", label: "UPI", icon: <CreditCard className="h-4 w-4" /> },
    {
      value: "online",
      label: "Online Transfer",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  if (!bill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">
                <span className="font-medium">Bill:</span> {bill.name}
              </p>
              <Badge variant="warning" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                <span>Flat {bill.flat}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {monthNames[bill.month - 1]} {bill.year}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                <span>₹{Number(bill.charges).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Payment Mode <span className="text-destructive">*</span>
              </label>
              <Dropdown
                options={paymentModeOptions}
                value={selectedPaymentMode}
                onChange={(value) =>
                  setValue("paymentMode", value as "cash" | "upi" | "online")
                }
                placeholder="Select payment mode"
                className={errors.paymentMode ? "border-destructive" : ""}
              />
              {errors.paymentMode && (
                <p className="text-xs text-destructive">
                  {errors.paymentMode.message}
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

          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
