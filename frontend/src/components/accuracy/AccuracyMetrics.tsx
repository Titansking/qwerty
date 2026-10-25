/**
 * AccuracyMetrics component.
 *
 * Displays quantitative forecast accuracy metrics (MAE, RMSE,
 * MAPE, bias, correlation) in a grid of cards with an
 * interpretation hint for each.
 */
import { MetricCard } from "@/components/common/MetricCard";
import { AccuracyMetrics } from "@/types";
import { formatMw, formatPercent } from "@/lib/utils";

interface AccuracyMetricsProps {
  metrics: AccuracyMetrics;
}

export function AccuracyMetricsPanel({ metrics }: AccuracyMetricsProps) {
  const biasDirection =
    metrics.mean_bias_mw > 0
      ? "systematically over-forecasting wind"
      : metrics.mean_bias_mw < 0
      ? "systematically under-forecasting wind"
      : "unbiased on average";

  const mapeInterpretation =
    metrics.mean_absolute_percentage_error < 10
      ? "High accuracy"
      : metrics.mean_absolute_percentage_error < 25
      ? "Moderate accuracy"
      : "Low accuracy — use caution";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        label="Mean Absolute Error (MAE)"
        value={formatMw(metrics.mean_absolute_error_mw)}
        sublabel="MW — average magnitude of forecast error"
      />
      <MetricCard
        label="Root Mean Squared Error (RMSE)"
        value={formatMw(metrics.root_mean_squared_error_mw)}
        sublabel="MW — penalises large errors more heavily"
      />
      <MetricCard
        label="Mean Absolute Percentage Error (MAPE)"
        value={formatPercent(metrics.mean_absolute_percentage_error)}
        sublabel={`% — ${mapeInterpretation}`}
      />
      <MetricCard
        label="Mean Bias"
        value={metrics.mean_bias_mw >= 0 ? `+${formatMw(metrics.mean_bias_mw)}` : formatMw(metrics.mean_bias_mw)}
        sublabel={`MW — ${biasDirection}`}
      />
      <MetricCard
        label="Correlation"
        value={metrics.correlation.toFixed(3)}
        sublabel="— linear relationship forecast vs actual"
      />
      <MetricCard
        label="Samples"
        value={metrics.sample_count}
        sublabel="forecast-actual pairs evaluated"
      />
    </div>
  );
}