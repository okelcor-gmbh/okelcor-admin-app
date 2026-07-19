import { apiFetch } from "./client";
import type { ChatSessionFull, ChatSessionStatus, ChatSessionSummary } from "./types";

export function fetchChatQueue(status?: ChatSessionStatus) {
  return apiFetch<{ data: ChatSessionSummary[]; message: string }>("/admin/chat-sessions", {
    params: status ? { status } : undefined,
  });
}

// Also used to (re)load a session's full transcript on open — there's no
// GET /admin/chat-sessions/{id}, so accepting is the only way to fetch
// messages. Safe to call again for a session you already own; 409s only if
// another admin has claimed it. See plan's "Known gaps" #2.
export function acceptChatSession(id: number) {
  return apiFetch<{ data: ChatSessionFull; message: string }>(`/admin/chat-sessions/${id}/accept`, {
    method: "POST",
  });
}

export function sendChatMessage(id: number, body: string) {
  return apiFetch<{ data: { id: number; created_at: string }; message: string }>(
    `/admin/chat-sessions/${id}/messages`,
    { method: "POST", body: { body } }
  );
}

export function closeChatSession(id: number) {
  return apiFetch<{ message: string }>(`/admin/chat-sessions/${id}/close`, { method: "POST" });
}
