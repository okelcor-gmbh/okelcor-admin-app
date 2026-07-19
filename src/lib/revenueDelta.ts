import type { DashboardRevenuePoint } from "../api/dashboard";

function pointValue(p: DashboardRevenuePoint): number {
  return Number(p.revenue ?? p.confirmed ?? p.amount ?? 0);
}

/** % change from the second-to-last day to the last day, or null if not computable. */
export function revenueDeltaPct(points?: DashboardRevenuePoint[]): number | null {
  if (!points || points.length < 2) return null;
  const yesterday = pointValue(points[points.length - 2]);
  const today = pointValue(points[points.length - 1]);
  if (yesterday === 0) return null;
  return Math.round(((today - yesterday) / yesterday) * 100);
}
