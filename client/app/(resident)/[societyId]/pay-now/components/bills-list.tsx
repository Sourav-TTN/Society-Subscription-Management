"use client";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/table";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { PendingBillResultType } from "./types";
import { IndianRupee, CreditCard } from "lucide-react";

interface UserBillsTableProps {
  bills: PendingBillResultType[];
  loading: boolean;
  monthNames: string[];
  onPayClick: (bill: PendingBillResultType) => void;
}

export const UserBillsTable = ({
  bills,
  loading,
  monthNames,
  onPayClick,
}: UserBillsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Period</TableHead>
              <TableHead>Flat</TableHead>
              <TableHead>Charges</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-9 w-24 bg-muted animate-pulse rounded ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="border rounded-lg bg-card p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-success/10 p-3 mb-4">
            <CreditCard className="h-6 w-6 text-success" />
          </div>
          <p className="text-muted-foreground">No pending bills found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Great! All your bills are paid up to date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill Period</TableHead>
            <TableHead>Flat</TableHead>
            <TableHead>Charges</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.billId}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">
                    {monthNames[bill.month - 1]} {bill.year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {bill.billId.slice(0, 8)}...
                  </p>
                </div>
              </TableCell>
              <TableCell>{bill.flat}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {bill.charges}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(bill.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => onPayClick(bill)}
                  disabled={bill.status === "paid"}
                >
                  <CreditCard className="mr-2 h-3 w-3" />
                  {bill.status === "paid" ? "Paid" : "Pay Now"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
