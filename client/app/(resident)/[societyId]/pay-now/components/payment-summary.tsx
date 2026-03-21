"use client";

import { PendingBillResultType } from "./types";
import { IndianRupee, Home, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";

interface UserPaymentSummaryProps {
  bills: PendingBillResultType[];
  userName: string;
  userFlat: string;
}

export const UserPaymentSummary = ({
  bills,
  userName,
  userFlat,
}: UserPaymentSummaryProps) => {
  const totalPending = bills.reduce(
    (total, bill) => total + parseFloat(bill.charges),
    0,
  );
  const hasPendingBills = bills.length > 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalPending.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {bills.length} pending bill(s)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Flat</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userFlat}</div>
          <p className="text-xs text-muted-foreground">{userName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          {hasPendingBills ? (
            <AlertCircle className="h-4 w-4 text-warning" />
          ) : (
            <CheckCircle className="h-4 w-4 text-success" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hasPendingBills ? "Pending" : "All Paid"}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasPendingBills
              ? "Please clear pending bills"
              : "No pending bills to pay"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
