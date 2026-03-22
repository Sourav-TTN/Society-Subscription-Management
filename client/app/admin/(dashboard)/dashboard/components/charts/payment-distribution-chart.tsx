import { PieChart, ResponsiveContainer, Pie, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface PaymentDistributionChartProps {
  data?: {
    method: string;
    amount: number;
    percentage?: number;
  }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const PaymentDistributionChart: React.FC<
  PaymentDistributionChartProps
> = ({ data }) => {
  const CustomTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{data.method}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600">Share</span>
            <span className="text-sm font-medium text-emerald-600">
              {data.percentage?.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
            {/* <span className="text-sm font-medium text-gray-900">
              {formatCurrency(entry.payload.value)}
            </span> */}
            <span className="text-xs text-gray-500">
              ({entry.payload.percentage?.toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const coloredData = data?.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={coloredData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          paddingAngle={4}
          dataKey="amount"
          nameKey="method"
          label={({ index }) => {
            const dataPoint = data?.[index];
            if (!dataPoint) return null;
            return `${dataPoint.method}: ${dataPoint.percentage?.toFixed(1)}%`;
          }}
          labelLine={false}
        />
        <Tooltip content={CustomTooltipContent} />
        <Legend content={CustomLegend} verticalAlign="bottom" height={80} />
      </PieChart>
    </ResponsiveContainer>
  );
};
