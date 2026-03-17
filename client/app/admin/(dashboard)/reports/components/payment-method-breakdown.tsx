import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import type { ReportsApiResponseType } from "./types";

interface PaymentMethodBreakdownProps {
  reports: ReportsApiResponseType;
}

export const PaymentMethodBreakdown = ({
  reports,
}: PaymentMethodBreakdownProps) => {
  const paymentMethods = [
    {
      title: "Cash Payments",
      value: reports.totalCashPayments,
      icon: Landmark,
    },
    {
      title: "UPI Payments",
      value: reports.totalUpiPayments,
      icon: Smartphone,
    },
    {
      title: "Online Payments",
      value: reports.totalOnlinePayments,
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        return (
          <Card key={method.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {method.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {method.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total transactions
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
