import { apiFetch } from "./client";
import type { AdminOrderFull, AdminQuoteRequest } from "./types";

export function approveFinancialRevision(orderId: number) {
  return apiFetch<{ data: unknown; message: string }>(
    `/admin/orders/${orderId}/financials/approve-revision`,
    { method: "POST" }
  );
}

export function rejectFinancialRevision(orderId: number, reason?: string) {
  return apiFetch<{ message: string }>(`/admin/orders/${orderId}/financials/reject-revision`, {
    method: "POST",
    body: reason ? { reason } : undefined,
  });
}

export function markOrderPaid(orderId: number, opts?: { paymentReference?: string; adminNote?: string }) {
  return apiFetch<{ data: AdminOrderFull; message: string }>(`/admin/orders/${orderId}/mark-paid`, {
    method: "POST",
    body: {
      confirmation: true,
      payment_reference: opts?.paymentReference,
      admin_note: opts?.adminNote,
    },
  });
}

export function updateQuoteStatus(quoteId: number, status: AdminQuoteRequest["status"]) {
  return apiFetch<{ data: AdminQuoteRequest; message: string }>(`/admin/quote-requests/${quoteId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateOrderStatus(orderId: number, status: string) {
  return apiFetch<{ data: AdminOrderFull; message: string }>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
  });
}
