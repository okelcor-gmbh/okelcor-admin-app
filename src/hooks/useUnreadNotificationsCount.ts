import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCount } from "../api/notifications";

export function useUnreadNotificationsCount(): number {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
  });
  return data?.unread_count ?? 0;
}
