import { LineChart, PieChart } from "lucide-react";
import { MonthlyTrend, PaymentMethod } from "./types";
import { ResidentCollectionTrendsChart } from "./collection-trends-chart";
import { ResidentPaymentDistributionChart } from "./payment-distribution-chart";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/card";

interface ChartsSectionProps {
  monthlyTrends: MonthlyTrend[];
  paymentMethods: PaymentMethod[];
  selectedYear: number;
}

export const ChartsSection = ({
  monthlyTrends,
  paymentMethods,
  selectedYear,
}: ChartsSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Payment Trends
          </CardTitle>
          <CardDescription>
            Monthly payment vs billed amount for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResidentCollectionTrendsChart data={monthlyTrends} variant="line" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Distribution of payments by method</CardDescription>
        </CardHeader>
        <CardContent>
          <ResidentPaymentDistributionChart data={paymentMethods} />
        </CardContent>
      </Card>
    </div>
  );
};
