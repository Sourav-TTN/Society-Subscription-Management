import {
  Area,
  XAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ResidentCollectionTrendsChartProps {
  data?: {
    month: string;
    paidAmount: number;
    totalBilled: number;
    paymentRate: number;
  }[];
  variant?: "area" | "line";
}

export const ResidentCollectionTrendsChart: React.FC<
  ResidentCollectionTrendsChartProps
> = ({ data, variant = "area" }) => {
  const formatCurrencyLocal = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600 mb-2">{data.month}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-sm text-gray-600">Paid Amount</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrencyLocal(data.paidAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Total Billed</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrencyLocal(data.totalBilled)}
            </span>
          </div>
          <div className="border-t pt-2 mt-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Payment Rate</span>
              <span className="text-sm font-semibold text-emerald-600">
                {data.paymentRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const shouldShowBoth = variant === "line";

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <Tooltip content={CustomTooltipContent} />
        <defs>
          <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          {shouldShowBoth && (
            <linearGradient id="billedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="month"
          style={{ fontSize: "12px", fill: "#6b7280" }}
          tickMargin={12}
        />
        <Area
          type="monotone"
          dataKey="paidAmount"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#paidGradient)"
          name="Paid Amount"
        />
        {shouldShowBoth && (
          <Area
            type="monotone"
            dataKey="totalBilled"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#billedGradient)"
            name="Total Billed"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};
