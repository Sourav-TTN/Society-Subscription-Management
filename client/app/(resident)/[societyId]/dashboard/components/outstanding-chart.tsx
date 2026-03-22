import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ResidentOutstandingChartProps {
  data?: {
    month: string;
    paidAmount: number;
    pendingAmount: number;
    totalBilled: number;
    paymentRate: number;
  }[];
}

export const ResidentOutstandingChart: React.FC<
  ResidentOutstandingChartProps
> = ({ data }) => {
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
        <p className="text-sm font-medium text-gray-900 mb-2">{data.month}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-sm text-gray-600">Paid</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.paidAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <span className="text-sm font-medium text-amber-600">
              {formatCurrency(data.pendingAmount)}
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

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-gray-500">
        No billing data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          style={{ fontSize: "12px", fill: "#6b7280" }}
          tickMargin={12}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          style={{ fontSize: "12px", fill: "#6b7280" }}
        />
        <Tooltip content={CustomTooltipContent} />
        <Bar
          dataKey="paidAmount"
          fill="#10b981"
          name="Paid Amount"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="pendingAmount"
          fill="#f59e0b"
          name="Pending Amount"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
