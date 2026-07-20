import { apiFetch } from "./client";
import type { AdminQuoteRequest, AdminQuoteRequestFull, PaginatedMeta, QuoteRequestSummary } from "./types";

export function fetchQuoteRequests(page = 1) {
  return apiFetch<{ data: AdminQuoteRequest[]; meta: PaginatedMeta; message: string }>(
    "/admin/quote-requests",
    { params: { page } }
  );
}

export function fetchQuoteRequestDetail(id: number) {
  return apiFetch<{ data: AdminQuoteRequestFull; message: string }>(`/admin/quote-requests/${id}`);
}

export function fetchQuoteSummary() {
  return apiFetch<{ data: QuoteRequestSummary; message?: string }>("/admin/quote-requests/summary");
}
