import { useQuery } from "@tanstack/react-query";
import { fetchInbox } from "../api/communications";

const POLL_MS = 30_000;

/** Counts unread rows on the first page only — same limitation the Inbox/Today screens already have. */
export function useUnreadInboxCount(): number {
  const { data } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => fetchInbox(1),
    refetchInterval: POLL_MS,
  });
  return (data?.data ?? []).filter((r) => r.unread).length;
}
