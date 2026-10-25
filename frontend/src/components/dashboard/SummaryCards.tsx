/**
 * SummaryCards component.
 *
 * Renders a grid of key metric cards at the top of the
 * dashboard - mean forecast, mean actual, MAE, and bias.
 */
import { MetricCard } from "@/components/common/MetricCard";
import { AccuracyMetrics } from "@/types";
import { formatMw } from "@/lib/utils";

interface SummaryCardsProps {
  metrics: AccuracyMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Mean Forecast"
        value={formatMw(metrics.mean_forecast_mw)}
        sublabel="MW — average forecasted wind"
      />
      <MetricCard
        label="Mean Actual"
        value={formatMw(metrics.mean_actual_mw)}
        sublabel="MW — average actual wind generation"
      />
      <MetricCard
        label="Mean Absolute Error"
        value={formatMw(metrics.mean_absolute_error_mw)}
        sublabel="MW — average |forecast − actual|"
      />
      <MetricCard
        label="Mean Bias"
        value={metrics.mean_bias_mw >= 0 ? `+${formatMw(metrics.mean_bias_mw)}` : formatMw(metrics.mean_bias_mw)}
        sublabel="MW — positive = over-forecast"
      />
    </div>
  );
}