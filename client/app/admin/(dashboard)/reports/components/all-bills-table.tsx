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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";

interface AllBillsTableProps {
  bills: BillReportType[];
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge variant="success">Paid</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const AllBillsTable = ({ bills }: AllBillsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bills</CardTitle>
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
                <TableHead>Status</TableHead>
                <TableHead>Payment Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {bill.ownerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bill.ownerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{bill.flat}</TableCell>
                  <TableCell className="text-foreground">
                    {monthNames[bill.month - 1]} {bill.year}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatCurrency(bill.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                  <TableCell>
                    {bill.paymentVia ? (
                      <Badge variant="outline" className="capitalize">
                        {bill.paymentVia}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
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
