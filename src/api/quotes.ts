import { apiFetch } from "./client";
import type { AdminQuoteRequest, PaginatedMeta } from "./types";

export function fetchQuoteRequests(page = 1) {
  return apiFetch<{ data: AdminQuoteRequest[]; meta: PaginatedMeta; message: string }>(
    "/admin/quote-requests",
    { params: { page } }
  );
}
