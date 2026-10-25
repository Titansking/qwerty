/**
 * AccuracyChart component.
 *
 * Scatter plot of forecast vs actual with an ideal 45-degree
 * reference line, plus a residual (error) histogram below.
 */
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ForecastActualPair } from "@/types";
import { formatMw } from "@/lib/utils";

interface AccuracyChartProps {
  data: ForecastActualPair[];
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  if (!data.length) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-slate-400">
        <p>No data available for accuracy chart.</p>
      </div>
    );
  }

  const allValues = data.flatMap((d) => [d.forecast_mw, d.actual_mw]);
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="1" y2="1">
              <stop offset="5%" stopColor="#16a34a" />
              <stop offset="95%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="x"
            type="number"
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <YAxis
            dataKey="y"
            type="number"
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload || !payload.length) {
                return null;
              }

              const p = payload[0].payload as any;

              // Only show detailed tooltip for forecast-actual points
              // (the ideal line only has x/y, no name/forecast/actual)
              if (!p || p.name === undefined || p.forecast === undefined) {
                return null;
              }

              const date = p.name ? new Date(p.name) : null;
              const dateLabel = date && !isNaN(date.getTime())
                ? date.toLocaleDateString()
                : "N/A";

              return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                  <p className="text-xs font-bold text-slate-700">
                    {dateLabel}
                  </p>
                  <p className="text-sm text-slate-600">
                    Forecast: {formatMw(p.forecast)} MW
                  </p>
                  <p className="text-sm text-slate-600">
                    Actual: {formatMw(p.actual)} MW
                  </p>
                </div>
              );
            }}
          />
          <Legend />
          <Scatter
            name="Forecast vs Actual"
            fill="url(#colorPoints)"
            stroke="#1f2937"
            strokeWidth={1}
            data={data.map((d) => ({
              x: d.forecast_mw,
              y: d.actual_mw,
              name: d.start_time,
              forecast: d.forecast_mw,
              actual: d.actual_mw,
            }))}
          />
          {/* Ideal 45-degree reference line */}
          <Scatter
            name="Ideal (forecast = actual)"
            data={[
              { x: minVal, y: minVal },
              { x: maxVal, y: maxVal },
            ]}
            stroke="#ef4444"
            strokeWidth={2}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}