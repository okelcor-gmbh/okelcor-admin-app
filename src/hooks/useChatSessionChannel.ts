import { useEffect } from "react";
import { subscribePrivate, unsubscribePrivate } from "../lib/pusher";
import type { ChatMessage, ChatSessionStatus } from "../api/types";

type Handlers = {
  onMessage: (message: ChatMessage) => void;
  onStatusChanged: (status: ChatSessionStatus) => void;
};

/**
 * Live updates for a single open chat thread. Only depends on `sessionId` —
 * callers must pass handlers that close over stable setState functions
 * (e.g. `(m) => setMessages((prev) => [...prev, m])`), not per-render
 * values, since the effect intentionally doesn't re-subscribe on every
 * render.
 */
export function useChatSessionChannel(sessionId: number, handlers: Handlers) {
  useEffect(() => {
    const channelName = `chat-session.${sessionId}`;
    const channel = subscribePrivate(channelName);
    if (!channel) return;

    const handleMessage = (data: ChatMessage) => handlers.onMessage(data);
    const handleStatus = (data: { status: ChatSessionStatus }) => handlers.onStatusChanged(data.status);

    channel.bind("message.sent", handleMessage);
    channel.bind("session.status_changed", handleStatus);

    return () => {
      channel.unbind("message.sent", handleMessage);
      channel.unbind("session.status_changed", handleStatus);
      unsubscribePrivate(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers must close over stable setters only, see doc comment above
  }, [sessionId]);
}
