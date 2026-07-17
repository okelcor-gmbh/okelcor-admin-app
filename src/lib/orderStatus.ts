export const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-severity-info-tint", text: "text-severity-info" },
  processing: { bg: "bg-severity-warning-tint", text: "text-severity-warning" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700" },
  shipped: { bg: "bg-purple-50", text: "text-purple-700" },
  delivered: { bg: "bg-severity-positive-tint", text: "text-severity-positive" },
  cancelled: { bg: "bg-severity-critical-tint", text: "text-severity-critical" },
};

export function orderStatusStyle(status: string): { bg: string; text: string } {
  return ORDER_STATUS_STYLES[status] ?? { bg: "bg-surface", text: "text-muted" };
}
