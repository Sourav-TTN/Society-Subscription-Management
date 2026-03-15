"use client";

import {
  Clock,
  Calendar,
  CreditCard,
  IndianRupee,
  CheckCircle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

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
import { ApiBillResponseType } from "./page-client";

interface BillsTableProps {
  bills: ApiBillResponseType[];
  onUpdateStatus: (bill: ApiBillResponseType) => void;
  monthNames: string[];
}

export const BillsTable = ({
  bills,
  onUpdateStatus,
  monthNames,
}: BillsTableProps) => {
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
            {" "}
            <CheckCircle className="h-3 w-3" /> Paid{" "}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1 w-fit">
            {" "}
            <Clock className="h-3 w-3" /> Pending{" "}
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
                  {bill.charges}
                </div>
              </TableCell>

              <TableCell>{getStatusBadge(bill.status)}</TableCell>

              <TableCell>
                {format(new Date(bill.createdAt), "dd MMM yyyy")}
              </TableCell>

              <TableCell className="text-right">
                {bill.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => onUpdateStatus(bill)}
                    className="text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
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
