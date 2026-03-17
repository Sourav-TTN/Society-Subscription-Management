"use client";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/table";
import { PendingBillType } from "./types";
import { Badge } from "@/components/badge";
import { IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/skeleton";

interface PendingBillsTableProps {
  bills: PendingBillType[];
  loading: boolean;
  monthNames: string[];
}

export const PendingBillsTable = ({
  bills,
  loading,
  monthNames,
}: PendingBillsTableProps) => {
  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Flat</TableHead>
              <TableHead>Bill Period</TableHead>
              <TableHead>Charges</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
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
        <p className="text-muted-foreground">No pending bills found</p>
        <p className="text-sm text-muted-foreground mt-1">
          All bills are paid or no bills have been generated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Owner</TableHead>
            <TableHead>Flat</TableHead>
            <TableHead>Bill Period</TableHead>
            <TableHead>Charges</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.billId}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{bill.ownerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {bill.ownerEmail}
                  </p>
                </div>
              </TableCell>
              <TableCell>{bill.flat}</TableCell>
              <TableCell>
                {monthNames[bill.month - 1]} {bill.year}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {bill.charges}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="warning" className="w-fit">
                  Pending
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
