/**
 * Forecasts page.
 *
 * Detailed view of forecasts and actuals with a full data table.
 */
import { useEffect } from "react";
import { useForecastStore } from "@/store/store";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { LatestForecastTable } from "@/components/dashboard/LatestForecastTable";

export function Forecasts() {
  const {
    pairs,
    loading,
    error,
    fetchPairs,
    clearError,
  } = useForecastStore();

  useEffect(() => {
    if (!pairs.length) {
      fetchPairs("2026-01-01", "2026-01-31");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !pairs.length) {
    return <Loading message="Loading forecast-actual pairs..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Forecasts &amp; Actuals</h1>
        <p className="text-slate-500">
          Matched wind generation forecasts and actuals by delivery period.
          January 2026.
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={clearError} />}

      <Card title="Forecast-Actual Pairs" subtitle="All matched periods for January 2026">
        <LatestForecastTable data={pairs} />
      </Card>
    </div>
  );
}