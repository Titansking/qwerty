/**
 * Zustand store for the GridBrick frontend.
 *
 * Central client-side state for wind forecast data, accuracy
 * metrics, and UI state. Keeps state management separate from
 * components and business logic.
 */
import { create } from "zustand";
import {
  ForecastActualPair,
  AccuracyMetrics,
  GenerationRecord,
} from "@/types";
import { apiClient } from "@/api/client";

interface ForecastState {
  // Data
  actuals: GenerationRecord[];
  forecasts: GenerationRecord[];
  pairs: ForecastActualPair[];
  metrics: AccuracyMetrics | null;

  // UI state
  loading: boolean;
  error: string | null;
  dateRange: { start: string; end: string };

  // Actions
  setDateRange: (range: { start: string; end: string }) => void;
  fetchActuals: (start: string, end: string, forceRefresh?: boolean) => Promise<void>;
  fetchForecasts: (start: string, end: string, forceRefresh?: boolean) => Promise<void>;
  fetchPairs: (start: string, end: string) => Promise<void>;
  fetchMetrics: (start: string, end: string) => Promise<void>;
  fetchAll: (start: string, end: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useForecastStore = create<ForecastState>((set, get) => ({
  actuals: [],
  forecasts: [],
  pairs: [],
  metrics: null,
  loading: false,
  error: null,
  dateRange: { start: "", end: "" },

  setDateRange: (range) => set({ dateRange: range }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchActuals: async (start, end, forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{
        data: GenerationRecord[];
        count: number;
      }>("/api/actuals", {
        start_date: start,
        end_date: end,
        force_refresh: forceRefresh,
      });
      set({ actuals: response.data || [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch actuals" });
    } finally {
      set({ loading: false });
    }
  },

  fetchForecasts: async (start, end, forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{
        data: GenerationRecord[];
        count: number;
      }>("/api/forecasts", {
        start_date: start,
        end_date: end,
        force_refresh: forceRefresh,
      });
      set({ forecasts: response.data || [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch forecasts" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPairs: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{
        data: ForecastActualPair[];
        count: number;
      }>("/api/forecast-actuals", {
        start_date: start,
        end_date: end,
      });
      set({ pairs: response.data || [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch forecast-actual pairs" });
    } finally {
      set({ loading: false });
    }
  },

  fetchMetrics: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{
        metrics: AccuracyMetrics;
        pairs: ForecastActualPair[];
      }>("/api/accuracy", {
        start_date: start,
        end_date: end,
      });
      set({ metrics: response.metrics || null, pairs: response.pairs || [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch accuracy metrics" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAll: async (start, end) => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchActuals(start, end, true),
        get().fetchForecasts(start, end, true),
        get().fetchMetrics(start, end),
      ]);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load data" });
    } finally {
      set({ loading: false });
    }
  },
}));