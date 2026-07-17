import { apiFetch } from "./client";
import type { AdminNotificationsResponse } from "./types";

export function fetchNotifications(page = 1) {
  return apiFetch<AdminNotificationsResponse>("/admin/notifications", { params: { page } });
}

export function fetchUnreadCount() {
  return apiFetch<{ unread_count: number }>("/admin/notifications/unread-count");
}

export function markNotificationRead(id: number) {
  return apiFetch<{ data: unknown; unread_count: number; message: string }>(
    `/admin/notifications/${id}/read`,
    { method: "POST" }
  );
}
