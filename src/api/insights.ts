import { apiFetch } from "./client";
import type { AdminInsightsResponse } from "./types";

export function fetchInsights() {
  return apiFetch<AdminInsightsResponse>("/admin/insights");
}
