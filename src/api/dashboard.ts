import { apiFetch } from "./client";

export type DashboardRevenuePoint = {
  date: string;
  revenue?: number;
  confirmed?: number;
  amount?: number;
};

export type DashboardSummary = {
  revenue_today?: number;
  orders_today_total?: number;
  orders_today_paid?: number;
  new_customers_today?: number;
  conversion_rate?: number;
  average_order_value?: number;
  aov_period_label?: string;
  aov_paid_orders_count?: number;
  aov_stripe_orders_count?: number;
  aov_manual_orders_count?: number;
  pending_orders?: number;
  confirmed_revenue_month?: number;
  pending_revenue?: number;
  revenue_last_7_days?: DashboardRevenuePoint[];
};

export function fetchDashboard() {
  return apiFetch<{ data: DashboardSummary; message?: string }>("/admin/dashboard");
}
