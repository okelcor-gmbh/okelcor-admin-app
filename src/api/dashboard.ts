import { apiFetch } from "./client";

export type DashboardRevenuePoint = {
  date: string;
  revenue?: number;
  confirmed?: number;
  amount?: number;
};

export type DashboardSummary = {
  revenue_today?: number;
  orders_today_paid?: number;
  new_customers_today?: number;
  conversion_rate?: number;
  average_order_value?: number;
  revenue_last_7_days?: DashboardRevenuePoint[];
};

export function fetchDashboard() {
  return apiFetch<{ data: DashboardSummary; message?: string }>("/admin/dashboard");
}
