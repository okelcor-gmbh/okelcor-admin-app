import { apiFetch } from "./client";
import type { AdminOrder, AdminOrderFull, PaginatedMeta } from "./types";

export function fetchOrders(query?: string, page = 1) {
  return apiFetch<{ data: AdminOrder[]; meta: PaginatedMeta; message: string }>("/admin/orders", {
    params: { q: query, page },
  });
}

export function fetchOrder(id: number) {
  return apiFetch<{ data: AdminOrderFull; message: string }>(`/admin/orders/${id}`);
}
