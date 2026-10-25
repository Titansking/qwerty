/**
 * Shared utility functions for the GridBrick frontend.
 *
 * Pure helper functions used across components. No framework
 * dependencies so they are easy to test and reuse.
 */
import { format, parseISO, formatDistanceToNow } from "date-fns";

export function formatDateTime(isoString: string): string {
  try {
    return format(parseISO(isoString), "dd MMM yyyy, HH:mm");
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    return format(parseISO(isoString), "dd MMM yyyy");
  } catch {
    return isoString;
  }
}

export function formatMw(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function relativeTime(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return isoString;
  }
}

export function getStatusColor(errorMw: number): string {
  const abs = Math.abs(errorMw);
  if (abs < 500) return "text-brand-600";
  if (abs < 1500) return "text-amber-600";
  return "text-rose-600";
}