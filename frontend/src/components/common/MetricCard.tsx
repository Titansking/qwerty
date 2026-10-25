/**
 * MetricCard component.
 *
 * Displays a single key metric with a label, value, optional
 * trend indicator, and colour-coded status. Used in summary
 * dashboards.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: { label: string; value: number; positive: boolean };
  className?: string;
}

export function MetricCard({
  label,
  value,
  sublabel,
  trend,
  className,
}: MetricCardProps) {
  const trendColor = trend?.positive ? "text-brand-600" : "text-rose-600";
  const trendIcon = trend?.positive ? "▲" : "▼";

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-5", className)}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
      </div>
      {trend && (
        <div className={cn("mt-2 text-xs font-medium flex items-center gap-1", trendColor)}>
          <span>{trendIcon}</span>
          <span>{Math.abs(trend.value).toFixed(1)}% {trend.label}</span>
        </div>
      )}
      {sublabel && !trend && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}