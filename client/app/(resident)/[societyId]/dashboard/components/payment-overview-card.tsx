import { MonthlyTrend } from "./types";
import { CircleDollarSign } from "lucide-react";
import { ResidentOutstandingChart } from "./outstanding-chart";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/card";

interface PaymentOverviewCardProps {
  monthlyTrends: MonthlyTrend[];
}

export const PaymentOverviewCard = ({
  monthlyTrends,
}: PaymentOverviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5" />
          Payment Overview
        </CardTitle>
        <CardDescription>
          Monthly comparison of paid vs pending amounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResidentOutstandingChart data={monthlyTrends} />
      </CardContent>
    </Card>
  );
};
