/**
 * ForecastChart component.
 *
 * Renders a line chart comparing forecasted vs actual wind
 * generation over time using Recharts. Shows both series with
 * a clear legend and tooltips.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ForecastActualPair } from "@/types";

interface ForecastChartProps {
  data: ForecastActualPair[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <p>No forecast-actual data available for the selected period.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: new Date(d.start_time).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    }),
    forecast: d.forecast_mw,
    actual: d.actual_mw,
    error: d.error_mw,
  }));

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      // payload rows are chartData entries, not raw ForecastActualPair objects
      const point = payload[0].payload as (typeof chartData)[number];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-xs font-bold text-slate-700">{point.name}</p>
          <p className="text-sm text-slate-600">
            Forecast: <span className="font-mono">{point.forecast.toLocaleString()}</span> MW
          </p>
          <p className="text-sm text-slate-600">
            Actual: <span className="font-mono">{point.actual.toLocaleString()}</span> MW
          </p>
          <p className="text-sm font-medium">
            Error:{point.error >= 0 ? " +" : " "}{point.error.toLocaleString()} MW
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `${v / 1000}k`}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            width={50}
          />
          <Tooltip content={customTooltip} />
          <Legend verticalAlign="top" align="right" height={36} />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: "#16a34a", strokeWidth: 2 }}
            name="Forecast"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2 }}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}