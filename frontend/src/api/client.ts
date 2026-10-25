/**
 * API client for the GridBrick frontend.
 *
 * Centralised fetch wrapper with base URL, error handling, and
 * request helpers. Keeps HTTP concerns separate from UI components.
 */
import { ApiError } from "@/types";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiClient {
  private base: string;

  constructor(baseUrl: string) {
    this.base = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.base}${path}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as ApiError;
        throw new Error(errorBody.detail || `HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Unknown API error");
    }
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    let url = path;
    if (params) {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        search.append(key, String(value));
      });
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request<T>(url, { method: "GET" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);