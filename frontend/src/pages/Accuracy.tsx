/**
 * Accuracy page.
 *
 * Shows quantitative forecast accuracy metrics (MAE, RMSE, MAPE,
 * bias, correlation) plus a scatter plot of forecast vs actual
 * and an error distribution histogram. Supports the client's
 * need to evaluate forecast accuracy quantitatively.
 */
import { useEffect } from "react";
import { useForecastStore } from "@/store/store";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { AccuracyMetricsPanel } from "@/components/accuracy/AccuracyMetrics";
import { AccuracyChart } from "@/components/accuracy/AccuracyChart";
import { ErrorDistribution } from "@/components/accuracy/ErrorDistribution";

export function Accuracy() {
  const {
    metrics,
    pairs,
    loading,
    error,
    fetchMetrics,
    clearError,
  } = useForecastStore();

  useEffect(() => {
    if (!metrics) {
      fetchMetrics("2026-01-01", "2026-01-31");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !metrics) {
    return <Loading message="Computing forecast accuracy metrics..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Forecast Accuracy</h1>
        <p className="text-slate-500">
          Quantitative evaluation of Elexon wind forecast accuracy against
          actual generation. January 2026.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={clearError} />}

      {metrics && (
        <div>
          <Card title="Accuracy Metrics" subtitle="Forecast vs actual wind generation">
            <AccuracyMetricsPanel metrics={metrics} />
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Forecast vs Actual Scatter" subtitle="Ideal line = perfect forecast">
          <AccuracyChart data={pairs} />
        </Card>
        <Card title="Error Distribution" subtitle="Frequency of forecast error buckets">
          <ErrorDistribution data={pairs} />
        </Card>
      </div>

      <div className="text-xs text-slate-400 mt-4">
        Metrics computed from matched forecast-actual pairs for January 2026.
        Bias is mean(forecast − actual); positive means over-forecasting.
      </div>
    </div>
  );
}