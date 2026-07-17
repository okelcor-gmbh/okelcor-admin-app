import { apiFetch } from "./client";
import type { SecuritySummary } from "./types";

export function fetchSecuritySummary() {
  return apiFetch<{ data: SecuritySummary }>("/admin/security/summary");
}
