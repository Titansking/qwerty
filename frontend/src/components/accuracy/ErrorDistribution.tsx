/**
 * ErrorDistribution component.
 *
 * Histogram of forecast errors showing how frequently forecasts
 * over- or under-estimate actual wind generation.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ForecastActualPair } from "@/types";

interface ErrorDistributionProps {
  data: ForecastActualPair[];
}

export function ErrorDistribution({ data }: ErrorDistributionProps) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
        <p>No error data available.</p>
      </div>
    );
  }

  // Bucket errors into ranges
  const buckets: { range: string; count: number }[] = [];
  const ranges = [
    { label: "Under -2000 MW", min: -Infinity, max: -2000 },
    { label: "Under -1000 MW", min: -2000, max: -1000 },
    { label: "Under -500 MW", min: -1000, max: -500 },
    { label: "±500 MW", min: -500, max: 500 },
    { label: "Over +500 MW", min: 500, max: 1000 },
    { label: "Over +1000 MW", min: 1000, max: 2000 },
    { label: "Over +2000 MW", min: 2000, max: Infinity },
  ];

  ranges.forEach((r) => {
    const count = data.filter(
      (d) => d.error_mw >= r.min && d.error_mw < r.max
    ).length;
    buckets.push({ range: r.label, count });
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={buckets} margin={{ top: 20, right: 30, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#6b7280" }} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="#16a34a"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}