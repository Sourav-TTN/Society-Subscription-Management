import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Badge } from "@/components/badge";
import type { BillReportType } from "./types";
import { Clock, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";

interface PendingPaymentsTableProps {
  pendingPayments: BillReportType[];
}

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PendingPaymentsTable = ({
  pendingPayments,
}: PendingPaymentsTableProps) => {
  if (pendingPayments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Pending Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((payment) => (
                <TableRow key={payment.billId}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.ownerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.ownerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {payment.flat}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {monthNames[payment.month - 1]} {payment.year}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" className="gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(payment.amount)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
