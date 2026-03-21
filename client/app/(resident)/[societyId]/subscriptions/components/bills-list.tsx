"use client";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/table";
import { format } from "date-fns";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { UserBillResultType } from "./client-page";
import { IndianRupee, Clock, CheckCircle } from "lucide-react";

interface BillsListProps {
  bills: UserBillResultType[];
  onPayBill: (bill: UserBillResultType) => void;
  monthNames: string[];
}

export const BillsList = ({ bills, onPayBill, monthNames }: BillsListProps) => {
  if (bills.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No bills found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Bills will appear here once they are generated from subscriptions.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="success" className="flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill Name</TableHead>
            <TableHead>Flat</TableHead>
            <TableHead>Month/Year</TableHead>
            <TableHead>Charges</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            {bills.some((bill) => bill.status === "paid") && (
              <TableHead>Payment Details</TableHead>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.billId}>
              <TableCell className="font-medium">{bill.name}</TableCell>

              <TableCell>{bill.flat}</TableCell>

              <TableCell>
                {monthNames[bill.month - 1]} {bill.year}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <IndianRupee className="h-3 w-3" />
                  {parseFloat(bill.charges).toLocaleString("en-IN")}
                </div>
              </TableCell>

              <TableCell>{getStatusBadge(bill.status)}</TableCell>

              <TableCell>
                {format(new Date(bill.createdAt), "dd MMM yyyy")}
              </TableCell>

              {bills.some((b) => b.status === "paid") && (
                <TableCell>
                  {bill.status === "paid" && bill.paidAt && (
                    <div className="text-sm">
                      <div className="text-muted-foreground">
                        {format(new Date(bill.paidAt), "dd MMM yyyy")}
                      </div>
                      {bill.paymentMode && (
                        <div className="text-xs text-muted-foreground capitalize">
                          via {bill.paymentMode}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
              )}

              <TableCell className="text-right">
                {bill.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => onPayBill(bill)}
                    className="text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    Pay Now
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
