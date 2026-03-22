import {
  Area,
  XAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface CollectionTrendsChartProps {
  data?: {
    month: string;
    collected: number;
    totalBilled: number;
  }[];
  variant?: "area" | "line" | "bar";
}

export const CollectionTrendsChart: React.FC<CollectionTrendsChartProps> = ({
  data,
  variant = "area",
}) => {
  // Transform data to have consistent date format
  const transformedData = data?.map((item) => ({
    ...item,
    date: new Date(2024, Number(item.month) - 1, 1), // Use month number for date
    income: item.collected,
    expenses: item.totalBilled,
  }));

  const formatCurrency = (value: number) => {
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
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Collected</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.collected)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-sm text-gray-600">Total Billed</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.totalBilled)}
            </span>
          </div>
          <div className="border-t pt-2 mt-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Collection Rate</span>
              <span className="text-sm font-semibold text-emerald-600">
                {((data.collected / data.totalBilled) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (variant === "line") {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <Tooltip content={CustomTooltipContent} />
          <defs>
            <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="billedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
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
            dataKey="collected"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#collectedGradient)"
            name="Collected"
          />
          <Area
            type="monotone"
            dataKey="totalBilled"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#billedGradient)"
            name="Total Billed"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={transformedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <Tooltip content={CustomTooltipContent} />
        <defs>
          <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
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
          dataKey="collected"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#collectedGradient)"
          name="Collected"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
