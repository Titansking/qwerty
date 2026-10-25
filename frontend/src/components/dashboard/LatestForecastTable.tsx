/**
 * LatestForecastTable component.
 *
 * Displays the most recent forecast for each delivery period
 * alongside the actual generation and error. Sorted by time.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ForecastActualPair } from "@/types";
import { formatDateTime, formatMw, getStatusColor } from "@/lib/utils";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LatestForecastTableProps {
  data: ForecastActualPair[];
}

export function LatestForecastTable({ data }: LatestForecastTableProps) {
  const latestByHour = new Map<string, ForecastActualPair>();
  data.forEach((pair) => {
    const hourKey = new Date(pair.start_time).getHours().toString();
    // Keep the latest publish time per hour
    const existing = latestByHour.get(hourKey);
    if (!existing || new Date(pair.publish_time || pair.start_time) > new Date(existing.publish_time || existing.start_time)) {
      latestByHour.set(hourKey, pair);
    }
  });

  const sorted = Array.from(latestByHour.values()).sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  if (!sorted.length) {
    return (
      <div className="text-center text-slate-400 py-8">
        No forecast data available for the selected period.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">Delivery Time</th>
            <th className="px-4 py-3 font-medium">Forecast (MW)</th>
            <th className="px-4 py-3 font-medium">Actual (MW)</th>
            <th className="px-4 py-3 font-medium">Error (MW)</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((pair) => {
            const isOver = pair.error_mw > 0;
            return (
              <tr key={pair.start_time} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-700 font-medium">
                  {formatDateTime(pair.start_time)}
                </td>
                <td className="px-4 py-3 text-slate-700 font-mono">
                  {formatMw(pair.forecast_mw)}
                </td>
                <td className="px-4 py-3 text-slate-700 font-mono">
                  {formatMw(pair.actual_mw)}
                </td>
                <td className={cn("px-4 py-3 font-mono font-medium", getStatusColor(pair.error_mw))}>
                  {pair.error_mw >= 0 ? "+" : ""}{pair.error_mw.toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      Math.abs(pair.error_mw) < 500
                        ? "bg-brand-50 text-brand-700"
                        : Math.abs(pair.error_mw) < 1500
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isOver ? "Over" : "Under"}-forecast
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}