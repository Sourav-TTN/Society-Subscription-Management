import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/progress";
import { ResidentDashboardOverview } from "./types";
import { Card, CardContent } from "@/components/card";
import { CheckCircle2, Clock, AlertCircle, Target } from "lucide-react";

interface StatsCardsProps {
  overview: ResidentDashboardOverview;
}

export const StatsCards = ({ overview }: StatsCardsProps) => {
  const stats = [
    {
      title: "Total Paid",
      value: formatCurrency(overview.totalPaid),
      subtitle: `${overview.paidBillsCount} bills paid`,
      color: "emerald",
      icon: CheckCircle2,
    },
    {
      title: "Total Pending",
      value: formatCurrency(overview.totalPending),
      subtitle: `${overview.pendingBillsCount} pending bills`,
      color: "amber",
      icon: Clock,
    },
    {
      title: "Total Outstanding",
      value: formatCurrency(overview.totalOutstanding),
      subtitle: "Overdue payments",
      color: "red",
      icon: AlertCircle,
    },
    {
      title: "Payment Compliance",
      value: `${overview.paymentComplianceRate.toFixed(1)}%`,
      subtitle: "",
      color: "blue",
      icon: Target,
      showProgress: true,
      progressValue: overview.paymentComplianceRate,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold text-${stat.color}-600 mt-2`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
                )}
                {stat.showProgress && (
                  <div className="mt-2">
                    <Progress value={stat.progressValue} className="h-2" />
                  </div>
                )}
              </div>
              <div
                className={`h-12 w-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
