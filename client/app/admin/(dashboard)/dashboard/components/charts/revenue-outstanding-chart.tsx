import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueOutstandingChartProps {
  data?: {
    month: string;
    revenue: number;
    outstanding: number;
    totalBilled?: number;
  }[];
}

export const RevenueOutstandingChart: React.FC<
  RevenueOutstandingChartProps
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
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-sm text-gray-600">Outstanding</span>
            </div>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(data.outstanding)}
            </span>
          </div>
          {data.totalBilled && (
            <div className="border-t pt-2 mt-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-600">Collection Rate</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {((data.revenue / data.totalBilled) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
          formatter={(value) => <span className="text-gray-600">{value}</span>}
        />
        <Bar
          dataKey="revenue"
          fill="#10b981"
          name="Revenue (Paid)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="outstanding"
          fill="#ef4444"
          name="Outstanding (Pending)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
