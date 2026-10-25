/**
 * Dashboard page.
 *
 * The client-facing overview showing the latest wind forecasts,
 * actual generation, and a side-by-side comparison chart.
 * Designed to be clear and actionable for day-ahead purchase
 * decisions.
 */
import { useEffect } from "react";
import { useForecastStore } from "@/store/store";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { LatestForecastTable } from "@/components/dashboard/LatestForecastTable";
import { formatDate } from "@/lib/utils";

export function Dashboard() {
  const {
    metrics,
    pairs,
    loading,
    error,
    dateRange,
    fetchAll,
    clearError,
    setDateRange,
  } = useForecastStore();

  const defaultStart = formatDate("2026-01-01T00:00:00Z");
  const defaultEnd = formatDate("2026-01-31T23:59:59Z");

  useEffect(() => {
    if (!dateRange.start) {
      setDateRange({ start: "2026-01-01", end: "2026-01-31" });
      fetchAll("2026-01-01", "2026-01-31");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !metrics) {
    return <Loading message="Fetching wind generation data from Elexon..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wind Forecast Portal</h1>
          <p className="text-slate-500">
            UK day-ahead wind generation forecasts &amp; accuracy —
            Elexon BMRS data for January 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              clearError();
              fetchAll("2026-01-01", "2026-01-31");
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={clearError} />}

      {/* Summary cards */}
      {metrics && <SummaryCards metrics={metrics} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card title="Forecast vs Actual Wind Generation" subtitle="MW, half-hourly delivery periods">
            <ForecastChart data={pairs} />
          </Card>
        </div>

        {/* Latest forecasts table */}
        <div className="lg:col-span-1">
          <Card
            title="Latest Forecasts by Period"
            subtitle="Most recent forecast per delivery hour"
          >
            <LatestForecastTable data={pairs} />
          </Card>
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-4">
        Data source: Elexon BMRS FUELHH (actuals) and WINDFOR (forecasts).
        Period: {defaultStart} to {defaultEnd}.
      </div>
    </div>
  );
}