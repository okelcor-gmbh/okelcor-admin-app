import { apiFetch } from "./client";

export type LogisticsSummary = {
  total_active_orders?: number;
  total_ebay_orders?: number;
  awaiting_proforma?: number;
  awaiting_customer_acceptance?: number;
  awaiting_deposit?: number;
  deposit_paid_docs_needed?: number;
  balance_due?: number;
  ready_for_shipment_release?: number;
  shipment_released?: number;
  ebay_needing_fulfillment?: number;
  missing_commercial_invoice?: number;
  missing_packing_list?: number;
  missing_shipment_document?: number;
  pending_eu_declarations?: number;
  high_risk_orders?: number;
  orders_shipped?: number;
  orders_delivered?: number;
};

// The endpoint also returns a paginated order checklist alongside
// data.summary — deliberately not typed/fetched here, a phone dashboard
// only needs the aggregate counts, not the full list.
export function fetchLogisticsSummary() {
  return apiFetch<{ data: { summary: LogisticsSummary }; message?: string }>("/admin/logistics/dashboard", {
    params: { per_page: 1 },
  });
}
