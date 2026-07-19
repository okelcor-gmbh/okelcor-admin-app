import { useEffect } from "react";
import { subscribePrivate, unsubscribePrivate } from "../lib/pusher";
import { queryClient } from "../lib/queryClient";

/**
 * Live updates for the chat queue (Today screen's "Live Chat" section).
 * Mounted once, app-wide, in main-tabs.tsx — stays subscribed regardless of
 * which tab is active. No-ops cleanly if Pusher isn't configured yet
 * (subscribePrivate returns null); the ~20s poll on the queue query is the
 * fallback either way.
 */
export function useChatQueueChannel() {
  useEffect(() => {
    const channel = subscribePrivate("admin.chat-queue");
    if (!channel) return;

    const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["chatQueue"] });
    channel.bind("session.requested", invalidate);
    channel.bind("session.status_changed", invalidate);

    return () => {
      channel.unbind("session.requested", invalidate);
      channel.unbind("session.status_changed", invalidate);
      unsubscribePrivate("admin.chat-queue");
    };
  }, []);
}
