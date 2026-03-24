"use client";

import { FaHourglassEnd } from "react-icons/fa";
import { CheckCircle, Hourglass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { UserBillResultType } from "./client-page";

interface BillsSummaryProps {
  bills: UserBillResultType[];
}

export const BillsSummary = ({ bills }: BillsSummaryProps) => {
  const pendingBills = bills.filter((bill) => bill.status === "pending");
  const paidBills = bills.filter((bill) => bill.status === "paid");

  const totalPendingAmount = pendingBills.reduce(
    (sum, bill) => sum + parseFloat(bill.charges),
    0,
  );
  const totalPaidAmount = paidBills.reduce(
    (sum, bill) => sum + parseFloat(bill.charges),
    0,
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FaHourglassEnd className="h-6 w-6 text-rose-400 dark:text-orange-400" />
            <span className="text-2xl font-bold">
              ₹{totalPendingAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {pendingBills.length} pending bill
            {pendingBills.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold">
              ₹{totalPaidAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {paidBills.length} paid bill{paidBills.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
