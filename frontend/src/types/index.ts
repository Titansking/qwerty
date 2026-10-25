/**
 * TypeScript type definitions for the GridBrick frontend.
 *
 * Centralises all shared types so the contract with the backend
 * API is explicit and consistent across components.
 */

export interface GenerationRecord {
  start_time: string;
  generation_mw: number;
  publish_time?: string | null;
  fuel_type?: string | null;
}

export interface ForecastActualPair {
  start_time: string;
  forecast_mw: number;
  actual_mw: number;
  error_mw: number; // forecast - actual
  abs_error_mw: number;
  publish_time?: string | null;
  forecast_hour?: number | null;
}

export interface AccuracyMetrics {
  mean_absolute_error_mw: number;
  root_mean_squared_error_mw: number;
  mean_absolute_percentage_error: number; // percentage
  mean_bias_mw: number; // positive = over-forecast
  correlation: number;
  sample_count: number;
  mean_forecast_mw: number;
  mean_actual_mw: number;
}

export interface ApiError {
  error: string;
  detail?: string;
  code?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ChartPoint {
  name: string;
  forecast: number;
  actual: number;
  error: number;
}