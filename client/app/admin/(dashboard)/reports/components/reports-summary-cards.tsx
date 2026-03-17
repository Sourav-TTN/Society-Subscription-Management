import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { IndianRupee, Users, FileText } from "lucide-react";
import type { ReportsApiResponseType } from "./types";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ReportsSummaryCardsProps {
  reports: ReportsApiResponseType;
}

export const ReportsSummaryCards = ({ reports }: ReportsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Collected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
            {formatCurrency(reports.totalCollected)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1 text-destructive">
            <IndianRupee className="h-5 w-5" />
            {formatCurrency(reports.totalPending)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            <Users className="h-5 w-5 text-muted-foreground" />
            {reports.pendingCustomers}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {reports.bills.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
